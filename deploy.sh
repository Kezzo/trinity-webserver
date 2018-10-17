#!/usr/bin/env sh
$(aws ecr get-login --no-include-email --region eu-west-1)
docker build -t dev-trinity-web-sever-registry .
docker tag dev-trinity-web-sever-registry:latest 524454272832.dkr.ecr.eu-west-1.amazonaws.com/dev-trinity-web-sever-registry:latest
docker push 524454272832.dkr.ecr.eu-west-1.amazonaws.com/dev-trinity-web-sever-registry:latest
aws ecs update-service --cluster dev-trinity-web-server-cluster --service dev-trinity-web-server-service --force-new-deployment

