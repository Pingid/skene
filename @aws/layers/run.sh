container_name="build-lambda-layer"

docker build -t $container_name .;

docker run -v $PWD:/app -w /app $container_name "sh generate.sh $1"

cd $1 && \
    zip -r "layer.zip" nodejs && \
    rm -rf nodejs

# docker run -v $PWD:/app -w /app "build-lambda-layer" "sh generate.sh $1"
# docker build -t "build-lambda-layer" .;