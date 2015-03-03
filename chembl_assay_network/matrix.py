__author__ = 'mnowotka'

from chembl_core_model.models import Assays
import numpy as np
import scipy.cluster.hierarchy as hy

#-----------------------------------------------------------------------------------------------------------------------

def fetchMatrix(doc_id):
    assays = Assays.objects.filter(doc__pk=doc_id)
    assays_ids = assays.values_list('chembl_id', 'assay_type', 'assay_test_type', 'description').order_by('chembl').distinct()
    size = len(assays_ids)
    data = np.empty((size, size), int)
    links = list()
    for i in range(size):
        for j in range(size):
            if j > i:
                continue
            a = set(Assays.objects.filter(chembl_id=assays_ids[i][0]).values_list(
                'compoundrecords__molecule__chembl_id').distinct())
            b = set(Assays.objects.filter(chembl_id=assays_ids[j][0]).values_list(
                'compoundrecords__molecule__chembl_id').distinct())
            val = len(a&b)
            data[i][j] = data[j][i] = val
            if val:
                links.append({"source":i, "target": j, "value":val})
    link = hy.linkage(data)
    indexes = hy.leaves_list(link).tolist()
    print indexes
    nodes = list()
    for i, assay in enumerate(assays_ids):
        nodes.append({
            "name" : assays_ids[i][0],
            "group": indexes.index(i),
            "assay_type": assays_ids[i][1],
            "assay_test_type": assays_ids[i][2],
            "description": assays_ids[i][3]
        })
    return {"nodes": nodes, "links": links}

#-----------------------------------------------------------------------------------------------------------------------
