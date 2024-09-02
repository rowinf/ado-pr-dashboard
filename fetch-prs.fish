#!/opt/homebrew/bin/fish

###
# STEP ZERO:
# Get the azure cli with devops extension and run this in the command line:
# $ `az login --allow-no-subscriptions`
##
set T_NUMBER t979140
set STATUS active
az repos pr list --creator $T_NUMBER --status $STATUS > ./data/$T_NUMBER-$STATUS.json