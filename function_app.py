import azure.functions as func 
from flask import Flask, Response, request
from snowflake import connector
import pandas as pd
import os
import pathlib

flask_app = Flask(__name__)

@flask_app.route('/Home')
def homepage():
    cur = cnx.cursor().execute("Select Name, count(*) from ADDRESSES group by NAME")
    data4charts=pd.DataFrame(cur.fetchall(), columns=['NAME','vote'])
    data4chartsJSON = data4charts.to_json(orient='records')
    html_file = pathlib.Path(__file__).parent / "home.html"
    htmlString = html_file.read_text()
    returnString = htmlString.replace("****data4chartsJSON****", data4chartsJSON)
    return Response(returnString)
    
@flask_app.route('/Submit')
def submitpage():
    html_file = pathlib.Path(__file__).parent / "submit.html"
    htmlString = html_file.read_text()
    return Response(htmlString)

@flask_app.route('/HardData')
def hardData():
    html_file = pathlib.Path(__file__).parent / "harddata.html"
    htmlString = html_file.read_text()
    dfhtml = updateRows().to_html()
    htmlString = htmlString.replace('****dfhtml****', dfhtml)
    return Response(htmlString)

@flask_app.route('/Thanks', methods=["POST"])
def thanks4submit():
    address = request.form.get("cname")
    name = request.form.get("uname")
    insertRow(address, name)
    html_file = pathlib.Path(__file__).parent / "thanks.html"
    htmlString = html_file.read_text()
    return Response(htmlString)
  
#snowflake
cnx = connector.connect(
    account= os.getenv('REGION'),
    user= os.getenv('USER'),
    password= os.getenv('PASSWORD'),
    warehouse='COMPUTE_WH',
    database='DEMO_DB',
    schema='PUBLIC'
)

def insertRow(address, name):
    cur = cnx.cursor()
    update_query = "INSERT INTO ADDRESSES(ADDRESS, NAME) VALUES (%s, %s)"
    cur.execute(update_query, (address, name))

def updateRows():
    cur = cnx.cursor()
    cur.execute("SELECT * FROM ADDRESSES")
    rows = pd.DataFrame(cur.fetchall(),columns=['ADDRESS', 'NAME'])
    return rows


app = func.WsgiFunctionApp(app=flask_app.wsgi_app, 
                           http_auth_level=func.AuthLevel.ANONYMOUS) 



