import sys, os
INTERP = os.path.join(os.environ['HOME'], 'abcd.walkerjeff.com', 'env', 'bin', 'python')

if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)
sys.path.append(os.getcwd())
 
from abcd.app import app as application
