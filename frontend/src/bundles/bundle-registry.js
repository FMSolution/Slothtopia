/** @typedef {import('../asset/asset-registry.js').AssetRegistry} AssetRegistry */

/**
 * Keeps track of which assets are in bundles and loads files from bundles.
 *
 * @private
 */
class BundleRegistry {
    /**
     * Create a new BundleRegistry instance.
     *
     * @param {AssetRegistry} assets - The asset registry.
     * @private
     */
    constructor(assets) {
        this._assets = assets;

        // index of bundle assets
        this._bundleAssets = {};
        // index asset id to one more bundle assets
        this._assetsInBundles = {};
        // index file urls to one or more bundle assets
        this._urlsInBundles = {};
        // contains requests to load file URLs indexed by URL
        this._fileRequests = {};

        this._assets.on('add', this._onAssetAdded, this);
        this._assets.on('remove', this._onAssetRemoved, this);
    }

    // Add asset in internal indexes
    _onAssetAdded(asset) {
        // if this is a bundle asset then add it and
        // index its referenced assets
        if (asset.type === 'bundle') {
            this._bundleAssets[asset.id] = asset;

            this._registerBundleEventListeners(asset.id);

            for (let i = 0, len = asset.data.assets.length; i < len; i++) {
                this._indexAssetInBundle(asset.data.assets[i], asset);
            }
        } else {
            // if this is not a bundle then index its URLs
            if (this._assetsInBundles[asset.id]) {
                this._indexAssetFileUrls(asset);
            }
        }
    }

    _registerBundleEventListeners(bundleAssetId) {
        this._assets.on('load:' + bundleAssetId, this._onBundleLoaded, this);
        this._assets.on('error:' + bundleAssetId, this._onBundleError, this);
    }

    _unregisterBundleEventListeners(bundleAssetId) {
        this._assets.off('load:' + bundleAssetId, this._onBundleLoaded, this);
        this._assets.off('error:' + bundleAssetId, this._onBundleError, this);
    }

    // Index the specified asset id and its file URLs so that
    // the registry knows that the asset is in that bundle
    _indexAssetInBundle(assetId, bundleAsset) {
        if (!this._assetsInBundles[assetId]) {
            this._assetsInBundles[assetId] = [bundleAsset];
        } else {
            const bundles = this._assetsInBundles[assetId];
            const idx = bundles.indexOf(bundleAsset);
            if (idx === -1) {
                bundles.push(bundleAsset);
            }
        }

        const asset = this._assets.get(assetId);
        if (asset) {
            this._indexAssetFileUrls(asset);
        }
    }

    // Index the file URLs of the specified asset
    _indexAssetFileUrls(asset) {
        const urls = this._getAssetFileUrls(asset);
        if (!urls) return;

        for (let i = 0, len = urls.length; i < len; i++) {
            const url = urls[i];
            // Just set the URL to point to the same bundles as the asset does.
            // This is a performance/memory optimization and it assumes that
            // the URL will not exist in any other asset. If that does happen then
            // this will not work as expected if the asset is removed, as the URL will
            // be removed too.
            this._urlsInBundles[url] = this._assetsInBundles[asset.id];
        }
    }

    // Get all the possible URLs of an asset
    _getAssetFileUrls(asset) {
        let url = asset.getFileUrl();
        if (!url) return null;

        url = this._normalizeUrl(url);
        const urls = [url];

        // a font might have additional files
        // so add them in the list
        if (asset.type === 'font') {
            const numFiles = asset.data.info.maps.length;
            for (let i = 1; i < numFiles; i++) {
                urls.push(url.replace('.png', i + '.png'));
            }
        }

        return urls;
    }

    // Removes query parameters from a URL
    _normalizeUrl(url) {
        return url && url.split('?')[0];
    }

    // Remove asset from internal indexes
    _onAssetRemoved(asset) {
        if (asset.type === 'bundle') {
            // remove bundle from index
            delete this._bundleAssets[asset.id];

            // remove event listeners
            this._unregisterBundleEventListeners(asset.id);

            // remove bundle from _assetsInBundles and _urlInBundles indexes
            for (const id in this._assetsInBundles) {
                const array = this._assetsInBundles[id];
                const idx = array.indexOf(asset);
                if (idx !== -1) {
                    array.splice(idx, 1);
                    if (!array.length) {
                        delete this._assetsInBundles[id];

                        // make sure we do not leave that array in
                        // any _urlInBundles entries
                        for (const url in this._urlsInBundles) {
                            if (this._urlsInBundles[url] === array) {
                                delete this._urlsInBundles[url];
                            }
                        }
                    }
                }
            }

            // fail any pending requests for this bundle
            this._onBundleError(`Bundle ${asset.id} was removed`, asset);

        } else if (this._assetsInBundles[asset.id]) {
            // remove asset from _assetInBundles
            delete this._assetsInBundles[asset.id];

            // remove asset urls from _urlsInBundles
            const urls = this._getAssetFileUrls(asset);
            for (let i = 0, len = urls.length; i < len; i++) {
                delete this._urlsInBundles[urls[i]];
            }
        }
    }

    // If we have any pending file requests
    // that can be satisfied by the specified bundle
    // then resolve them
    _onBundleLoaded(bundleAsset) {
        // this can happen if the bundleAsset failed
        // to create its resource
        if (!bundleAsset.resource) {
            this._onBundleError(`Bundle ${bundleAsset.id} failed to load`, bundleAsset);
            return;
        }

        // on next tick resolve the pending asset requests
        // don't do it on the same tick because that ties the loading
        // of the bundle to the loading of all the assets
        requestAnimationFrame(() => {
            // make sure the registry hasn't been destroyed already
            if (!this._fileRequests) {
                return;
            }

            for (const url in this._fileRequests) {
                const bundles = this._urlsInBundles[url];
                if (!bundles || bundles.indexOf(bundleAsset) === -1) continue;

                const decodedUrl = decodeURIComponent(url);
                let err = null;
                if (!bundleAsset.resource.hasBlobUrl(decodedUrl)) {
                    err = `Bundle ${bundleAsset.id} does not contain URL ${url}`;
                }

                const requests = this._fileRequests[url];
                for (let i = 0, len = requests.length; i < len; i++) {
                    if (err) {
                        requests[i](err);
                    } else {
                        requests[i](null, bundleAsset.resource.getBlobUrl(decodedUrl));
                    }
                }

                delete this._fileRequests[url];
            }
        });
    }

    // If we have outstanding file requests for any
    // of the URLs in the specified bundle then search for
    // other bundles that can satisfy these requests.
    // If we do not find any other bundles then fail
    // those pending file requests with the specified error.
    _onBundleError(err, bundleAsset) {
        for (const url in this._fileRequests) {
            const bundle = this._findLoadedOrLoadingBundleForUrl(url);
            if (!bundle) {
                const requests = this._fileRequests[url];
                for (let i = 0, len = requests.length; i < len; i++) {
                    requests[i](err);
                }

                delete this._fileRequests[url];

            }
        }
    }

    // Finds a bundle that contains the specified URL but
    // only returns the bundle if it's either loaded or being loaded
    _findLoadedOrLoadingBundleForUrl(url) {
        const bundles = this._urlsInBundles[url];
        if (!bundles) return null;

        // look for loaded bundle first...
        const len = bundles.length;
        for (let i = 0; i < len; i++) {
            // 'loaded' can be true but if there was an error
            // then 'resource' would be null
            if (bundles[i].loaded && bundles[i].resource) {
                return bundles[i];
            }
        }

        // ...then look for loading bundles
        for (let i = 0; i < len; i++) {
            if (bundles[i].loading) {
                return bundles[i];
            }
        }

        return null;
    }

    /**
     * Lists all of the available bundles that reference the specified asset id.
     *
     * @param {Asset} asset - The asset.
     * @returns {Asset[]} An array of bundle assets or null if the asset is not in any bundle.
     * @private
     */
    listBundlesForAsset(asset) {
        return this._assetsInBundles[asset.id] || null;
    }

    /**
     * Lists all of the available bundles. This includes bundles that are not loaded.
     *
     * @returns {Asset[]} An array of bundle assets.
     * @private
     */
    list() {
        const result = [];
        for (const id in this._bundleAssets) {
            result.push(this._bundleAssets[id]);
        }

        return result;
    }

    /**
     * Returns true if there is a bundle that contains the specified URL.
     *
     * @param {string} url - The url.
     * @returns {boolean} True or false.
     * @private
     */
    hasUrl(url) {
        return !!this._urlsInBundles[url];
    }

    /**
     * Returns true if there is a bundle that contains the specified URL and that bundle is either
     * loaded or currently being loaded.
     *
     * @param {string} url - The url.
     * @returns {boolean} True or false.
     * @private
     */
    canLoadUrl(url) {
        return !!this._findLoadedOrLoadingBundleForUrl(url);
    }

    /**
     * Loads the specified file URL from a bundle that is either loaded or currently being loaded.
     *
     * @param {string} url - The URL. Make sure you are using a relative URL that does not contain
     * any query parameters.
     * @param {Function} callback - The callback is called when the file has been loaded or if an
     * error occurs. The callback expects the first argument to be the error message (if any) and
     * the second argument is the file blob URL.
     * @example
     * var url = asset.getFileUrl().split('?')[0]; // get normalized asset URL
     * this.app.bundles.loadFile(url, function (err, blobUrl) {
     *     // do something with the blob URL
     * });
     * @private
     */
    loadUrl(url, callback) {
        const bundle = this._findLoadedOrLoadingBundleForUrl(url);
        if (!bundle) {
            callback(`URL ${url} not found in any bundles`);
            return;
        }

        // Only load files from bundles that're explicitly requested to be loaded.
        if (bundle.loaded) {
            const decodedUrl = decodeURIComponent(url);
            if (!bundle.resource.hasBlobUrl(decodedUrl)) {
                callback(`Bundle ${bundle.id} does not contain URL ${url}`);
                return;
            }

            callback(null, bundle.resource.getBlobUrl(decodedUrl));
        } else if (this._fileRequests.hasOwnProperty(url)) {
            this._fileRequests[url].push(callback);
        } else {
            this._fileRequests[url] = [callback];
        }
    }

    /**
     * Destroys the registry, and releases its resources. Does not unload bundle assets as these
     * should be unloaded by the {@link AssetRegistry}.
     *
     * @private
     */
    destroy() {
        this._assets.off('add', this._onAssetAdded, this);
        this._assets.off('remove', this._onAssetRemoved, this);

        for (const id in this._bundleAssets) {
            this._unregisterBundleEventListeners(id);
        }

        this._assets = null;
        this._bundleAssets = null;
        this._assetsInBundles = null;
        this._urlsInBundles = null;
        this._fileRequests = null;
    }
}

export { BundleRegistry };
