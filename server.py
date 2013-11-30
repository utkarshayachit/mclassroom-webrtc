"""Simple twisted web-server that simply serves the webpages"""
from twisted.internet import reactor
from twisted.web.server import Site
from twisted.web.static import File

root = File("/Users/utkarsh/Kitware/MClassroom")
site = Site(root)
reactor.listenTCP(8080, site)
reactor.run()
