#! /bin/bash

echo "Starting update LilyPrint"
cd ~/OctoPrint && git pull && sudo pip install -r requirements.txt

echo "Update Done."

exec $SHELL
