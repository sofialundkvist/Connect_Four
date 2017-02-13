# *-* coding:utf-8 *-*

import bottle
from bottle import route, get, post, run, template, error, static_file, request, redirect
import json

@route('/')
def start():
    ''' Returns template for Connect Four website '''
    return template('index.html')

@route('/save_highscore', method="POST")
def save_highscore():
    ''' Saves players highscore to highscore.txt '''
    player_id = request.forms.get('id')
    name = request.forms.get('name')
    highscore = request.forms.get('score')
    current_highscores = get_highscores()
    if current_highscores == "":
        current_highscores = {str(player_id): {"name": name, "score": highscore}}
    else:
        current_highscores[str(player_id)] = {"name": name, "score": highscore}

    json_scores = json.dumps(current_highscores)

    try:
        highscore_file = open("highscores.txt", "w")
        highscore_file.write(json_scores)
        highscore_file.close()
        return "Sparat"
    except:
        return "Ej sparat"

@route('/get_highscores')
def get_highscores():
    ''' Returns all highscores from highscore.txt in JSON-format '''
    highscore_file = open("highscores.txt", "r")
    try:
        highscores = json.loads(highscore_file.read())
        highscore_file.close()
        return highscores
    except:
        return ""

@route('/log', method="POST")
def write_to_log():
    ''' Writes to log file: log.txt '''
    text = request.forms.get('text')
    log_file = open("audit.txt", "a")
    log_file.write(text + "\n")
    log_file.close()

@route('/new_id')
def get_new_id():
    ''' Checks which ID:s are already in highscores.txt and returns two new ones '''
    try:
        highscore_file = open("highscores.txt", "r")
        highscores = json.loads(highscore_file.read())
        highscore_file.close()
        id_list = []
        for player_id in highscores:
            id_list.append(int(player_id))
        max_id = max(id_list)
        id_1 = max_id + 1
        id_2 = max_id + 2
    except:
        highscore_file = open("highscores.txt", "w")
        highscore_file.close()
        id_1 = 1
        id_2 = 2
    return {"id1": id_1, "id2": id_2}


@error(404)
def error404(error):
    return "Something went wrong..."

@route('/static/<filename:path>')
def server_static(filename):
    ''' Loads static file '''
    return static_file(filename, root="static")

run(host='localhost', port=8080, debug=True, reloader=True)
