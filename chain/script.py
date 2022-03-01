import json
import os


def readFile(filename):
	with open(filename, 'r') as fin:
		temp = json.loads(fin.read())
	return temp

def writeFile(data, fileiter, filepath):
	with open('%s/%s.json'%(filepath, basic_name), 'w') as fout:
		fout.write(json.dumps(data))

def editData(dir_path_in, dir_path_out):
	os.chdir(dir_path_in)
	all_files = os.listdir()
	for i in all_files:
		temp = readFile(i)
		basic_name = temp['name'].replace('Slothtopia #','')
		temp['image'] = 'https://api.slothtopia.io/get/avatars/%s.glb'%basic_name
		temp['3d'] = 'https://api.slothtopia.io/get/avatars/%s.glb'%basic_name
		del(temp['NFT_DNA'])
		writeFile(temp, basic_name, dir_path_out)
