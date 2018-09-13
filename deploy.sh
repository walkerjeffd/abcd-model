#!/bin/bash

set -eu

cd build
scp -r . jeff@walkerenvres-new:/var/www/abcd.walkerenvres.com/
