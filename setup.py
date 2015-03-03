#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'mnowotka'

import sys

try:
    from setuptools import setup
except ImportError:
    from ez_setup import use_setuptools
    use_setuptools()
    from setuptools import setup

if sys.version_info < (2, 7, 3) or sys.version_info >= (2, 7, 7):
    raise Exception('ChEMBL software stack requires python 2.7.3 - 2.7.7')

setup(
    name='chembl_assay_network',
    version='0.6.0',
    author='Michal Nowotka',
    author_email='mnowotka@ebi.ac.uk',
    description='Python package generating compound co-occurance matrix for all assays from given document',
    url='https://www.ebi.ac.uk/chembldb/index.php/ws',
    license='CC BY-SA 3.0',
    packages=['chembl_assay_network'],
    long_description=open('README.rst').read(),
    install_requires=[
        'chembl_core_model>=0.6.0',
        'numpy>=1.7.1',
        'scipy',
    ],
    include_package_data=True,
    classifiers=['Development Status :: 2 - Pre-Alpha',
                 'Environment :: Web Environment',
                 'Framework :: Django',
                 'Intended Audience :: Developers',
                 'License :: Creative Commons :: Attribution-ShareAlike 3.0 Unported',
                 'Operating System :: POSIX :: Linux',
                 'Programming Language :: Python :: 2.7',
                 'Topic :: Scientific/Engineering :: Chemistry'],
    zip_safe=False,
)