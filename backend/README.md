
# SLOTHTOPIA

## BACKEND SERVER *(python3-flask)*

___app.py:___ is a customized flask server to respond to different fetching mechanims <br />
<br />
___app.py:___ has 2 different constants that determine the main operations `ALLOWED_EXTENSIONS` && `ALLOWED_ASSETS`<br />
<br />
___app.py:___ any requests done to /get/<filetype>/<filename> will be checked aganist `ALLOWED` to determine if it should serve<br />
<br />
___app.py:___ two main functions that utilize an *SQLite3* database to create a multiplayer world<br />
<br />
___engine.py:___ ensures legitemacy of requests done to the server by using (assert)<br />
<br />
___engine.py:___ perform CRUD operations on the database specified under the constant `MAIN_DB_PATH`<br />
<br />
___engine.py:___ perform *web3* calls to add the NFT url to the GLB file, so other requests may render the player<br />


@author:**mr.kj**
