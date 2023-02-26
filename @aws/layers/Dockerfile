# FROM amazon/aws-lambda-nodejs:18.2023.02.17.11
FROM public.ecr.aws/lambda/nodejs:18
# FROM node:18.14

# update 
# RUN apt-get update -y && \
#     apt-get upgrade -y && \
#     apt-get install -y
# RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
# RUN rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg
# RUN yum install yarn

RUN yum update -y
RUN yum install -y python3
# RUN yum groupinstall 'Development Tools'
RUN yum install -y gcc gcc-c++ make 

RUN node -v
RUN npm install -g npm@9.5.1

ENTRYPOINT [ "/bin/bash", "-l", "-c" ]
CMD [ "ls" ]