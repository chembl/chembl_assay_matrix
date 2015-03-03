__author__ = 'mnowotka'

from django.http import HttpResponse
from chembl_assay_network.matrix import fetchMatrix
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from chembl_core_model.models import Docs
import json
from django.views.decorators.cache import cache_page

#-----------------------------------------------------------------------------------------------------------------------

@cache_page(60 * 60 * 24 * 28)
def getMatrix(request, doc_id):
    data = fetchMatrix(doc_id)
    serialised_data = json.dumps(data)
    response = HttpResponse(serialised_data, content_type="application/json")
    return response

#-----------------------------------------------------------------------------------------------------------------------

def showMatrix(request, doc_id=None):
    doc = get_object_or_404(Docs, pk=doc_id)
    context = {'doc_id': doc_id, 'paper_title': doc.title, 'pubmed_id': doc.pubmed_id}
    return render(request, 'cooccurance.html', context)

#-----------------------------------------------------------------------------------------------------------------------