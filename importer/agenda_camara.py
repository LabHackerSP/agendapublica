import urllib2
import pprint
import pandas as pd
import json


def get_data(url):
    """
    Get html file from url
    :param url: string
    :return: string (json)
    """

    response = urllib2.urlopen(url)
    json = response.read().decode('latin-1')

    return json

def parse(json):

    json.dumps(json)

    print json.keys()

if __name__ == '__main__':

    json = get_data('http://www1.camara.sp.gov.br/agenda_json.asp')

    parse(json)