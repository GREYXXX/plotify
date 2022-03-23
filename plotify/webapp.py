import os
import sqlite3
import json
from functools import wraps

from flask import Flask, Response, g, send_file, send_from_directory, request

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'plotify.db')
PORT = 8080

webapp = Flask(__name__)


def get_db() -> sqlite3.Connection:
    """
    Fetches a request-scoped database connection
    """
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect("file:{}?mode=ro".format(DATABASE_PATH), uri=True)
    return db


@webapp.teardown_appcontext
def close_connection(exception):
    """
    Close database at the end of each request if required
    """
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def json_response(f):
    @wraps(f)
    def inner(*args, **kwargs):
        result = f(*args, **kwargs)
        return Response(json.dumps(result), mimetype="application/json")
    return inner


@webapp.route("/")
def index():
    return send_file("static/index.html")


@webapp.route("/dist/<path:path>")
def static_dist(path):
    return send_from_directory("static/dist", path)


@webapp.route("/api/attributes")
@json_response
def get_attributes():
    """
    Should fetch a list of unique student attributes

    Response format:
    {
        attributes: [
            {
                name: "...",
            },
            ...
        ]
    }
    """

    con = get_db()
    cur = con.cursor()
    info = cur.execute("select distinct attribute from student_attribute").fetchall()
    info = {
        'attributes' : 
        [{'name' : i[0]} for i in info]
    }
    con.close()
    return info


@webapp.route("/api/chart", methods=["POST"])
@json_response
def get_chart():
    """
    Should fetch the data for the chart
    The request may have POST data

    Response format:
    {
        chartType: ChartType,
        data: [Data],
        options: Options,
    }
    where ChartType, Data, and Options are as demonstrated on https://react-google-charts.com/
    """
    attribute = request.form.get('attribute')
    options = {
        "chartArea" : {"left":100,"top":100, "width":'90%',"height":'75%'},
        "vAxis": {
            "title": 'Number of Students'
        },
        "legend": {"position": "bottom", "maxLines": 2},
    }

    con = get_db()
    cur = con.cursor()
    info = cur.execute(
        """
        SELECT class.teacher_name, student_attribute.attribute, count(student_attribute.attribute) FROM student 
        JOIN class on class.id = student.class_id
        JOIN student_attribute on student.name = student_attribute.student_name  
        GROUP BY student_attribute.attribute, class.teacher_name
        ORDER BY class.teacher_name
        """
        ).fetchall()

    # The query we execute extracts the data format as [(Teacher_name, Attribute, COUNT)], COUNT  means how many students of this teacher 
    # has this attribute

    # We need to proces the data format to match the input of google-react-chart, which looks like [[Teacher_name, A1, A2,...,An], []]
    # To process this more efficient. I init a table to store the number of students of every attributes of every teachers
    # Table : {Name 1 :{A1 : 0, A2 : 0,..., An : 0}, Name 2 : {A1 : 0, A2 : 0, A3 : 0, ..., An : 0},..., Name N : {...}}
    # Then we can loop the query data extracting from database to change the number of each attribute.
   
    names = cur.execute("select teacher_name from class").fetchall()
    names = [x[0] for x in names]
    atts  = cur.execute("select distinct attribute from student_attribute").fetchall()
    atts = [x[0] for x in atts]
    table = {i : {j : 0 for j in atts} for i in names}

    # info[i][0] -- > Teacher Name
    # info[i][1] -- > Attribute
    # info[i][2] -- > COUNT

    for i in range(len(info)):
         table[info[i][0]][info[i][1]] = info[i][2]

    init = [['Teacher_Name'] + atts]
    data = [[key] + list(val.values()) for key, val in table.items()]
    data = init + data
    con.close()

    if attribute == None:
        options['title'] = "Attributes distribution for all teachers"
        return {
            'data' : data, 
            'chartType': 'ColumnChart',
            'options' :options
        }  

    else:
        options['title'] = "Attributes distribution for" + " " + str(attribute)
        idx = data[0].index(attribute)
        attribute_data = [[data[i][0], data[i][idx]] for i in range(len(data))]
        return {
            'data' : attribute_data, 
            'chartType': 'ColumnChart',
            'options' :options
        }  