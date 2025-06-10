import azure.functions as func
from flask import Flask, render_template, request
from snowflake import connector
import pandas as pd
import os
import json

app = Flask(__name__)

@app.route('/')
def homepage():
    cur = cnx.cursor().execute("Select Name, count(*) from ADDRESSES group by NAME;")
    data4charts = pd.DataFrame(cur.fetchall(), columns=['NAME', 'vote'])
    data4chartsJSON = data4charts.to_json(orient='records')
    
    # Query for data to be used in the falling data stream
    cur = cnx.cursor().execute("SELECT ADDRESS, NAME FROM ADDRESSES LIMIT 50;")
    threejs_stream_data = json.dumps(cur.fetchall())
    
    return render_template('charts.html', data4chartsJSON=data4chartsJSON, threejs_stream_data=threejs_stream_data)

@app.route('/Submit')
def submitpage():
    return render_template('submit.html')

@app.route('/HardData')
def hardData():
    # Query the ADDRESSES table and pass the full result as JSON
    cur = cnx.cursor().execute("SELECT ADDRESS, NAME FROM ADDRESSES")
    interactive_table_data = json.dumps(cur.fetchall())
    return render_template('index.html', interactive_table_data=interactive_table_data)

@app.route('/thanks4submit', methods=["POST"])
def thanks4submit():
    address = request.form.get("cname")
    name = request.form.get("uname")
    insertRow(address, name)
    return render_template('thanks4submit.html',
                           colorname=address,
                           username=name)
    
# Snowflake connection
cnx = connector.connect(
    account=os.environ.get('REGION'),
    user=os.environ.get('USERNAME'),
    password=os.environ.get('PASSWORD'),
    warehouse='COMPUTE_WH',
    database='DEMO_DB',
    schema='PUBLIC',
    role='python_role'
)

def insertRow(address, name):
    cur = cnx.cursor()
    updateString = "INSERT INTO ADDRESSES(ADDRESS, NAME) VALUES ('{}', '{}')".format(address, name)
    print(updateString)
    cur.execute(updateString)

def updateRows():
    cur = cnx.cursor()
    cur.execute("SELECT * FROM ADDRESSES")
    rows = pd.DataFrame(cur.fetchall(), columns=['ADDRESS', 'NAME'])
    return rows

# Azure Functions HTTP trigger handler
def main(req: func.HttpRequest) -> func.HttpResponse:
    """Each request is redirected to the WSGI handler."""
    return func.WsgiMiddleware(app).handle(req)
