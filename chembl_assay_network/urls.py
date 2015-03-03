__author__ = 'mnowotka'

from django.conf.urls import patterns, url
from chembl_assay_network import views


urlpatterns = patterns('',
    url(r'^occurance_data/(?P<doc_id>\d*)', views.getMatrix, name="occurance_data"),
    url(r'^assay_network/(?P<doc_id>\d*)', views.showMatrix, name="view"),
)