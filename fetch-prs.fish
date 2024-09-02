#!/opt/homebrew/bin/fish

set T_NUMBER t979140
set STATUS active
az repos pr list --creator $T_NUMBER --status $STATUS > ./data/$T_NUMBER-$STATUS.json