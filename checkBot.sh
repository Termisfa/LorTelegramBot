#!/bin/sh

NUMERO=$(($1-1))

if [ $NUMERO -lt 0 ]
 then
 NUMERO=$(($NUMERO+24));
fi



FILE=/home/pi/checker/$NUMERO
if test ! -f "$FILE"; then
    docker stop bot;
    docker start bot;
fi

