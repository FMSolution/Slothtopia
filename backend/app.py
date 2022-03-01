from flask import Flask, send_file, request, redirect, url_for,jsonify
import os
from flask_cors import CORS
from werkzeug.utils import secure_filename
import logging
from engine import parseInfo,parseGetter

app = Flask(__name__)
CORS(app)
app.logger.setLevel(logging.INFO)

ALLOWED_EXTENSIONS = {'js', 'glb', 'wasm', 'png', 'json','dds'}

ALLOWED_ASSETS = {'scripts', 'models', 'textures', 'animations', 'fonts', 'avatars', 'cubemaps', 'metadata'}

def allowed_file(filename):
	return '.' in filename and \
		   filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def allowed_dirs(filetype):
	return str(filetype).lower().strip() in ALLOWED_ASSETS


@app.route("/")
def hello_world():
	return "<p>Slothopia API!</p>"


@app.route('/get/<filetype>/<filename>')
def sendFile(filetype, filename):
	if(not allowed_file(filename) or not allowed_dirs(filetype)):
		return "Not Allowed",404
	fullPath = os.getcwd() + '/assets/%s/%s'%(filetype, filename)
	if('wasm' in filename.rsplit('.', 1)[1].lower()):
		app.logger.info('WASM file name %s'%filename);
		return(send_file(fullPath, mimetype='application/wasm'))
	elif ('js' in filename):
		return(send_file(fullPath, mimetype='application/javascript'))
	else:
		return(send_file(fullPath))



@app.route('/playerInfo', methods=['GET'])
def setVersePlayers():
	try:
		app.logger.info(str(request.headers['plyrDATA']))
		playerData = str(request.headers['plyrDATA'])
		res = parseInfo(playerData)
		return 'GOOD REQUEST',200
	except:
		return 'BAD REQUEST',400
	


@app.route('/getPlayers', methods=['GET'])
def getVersePlayers():
	try:
		playerData = str(request.headers['plyrDATA'])
		resp = parseGetter(playerData)
		return jsonify(resp), 200
	except:
		return 'BAD REQUEST',400

