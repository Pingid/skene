# Generate lambda layers

function node_layer {
    dir=$1;
    
    echo "Building $dir"
    [ ! -f "$dir/package.json" ] && echo "Missig $dir/package.json" && exit 1;

    cd "$dir" && \
        rm -rf nodejs && \
        mkdir nodejs && \
        cp package.json nodejs/ && \
        cd nodejs && \
        npm install --omit=dev && \
        rm -rf package.json package-lock.json && \
        cd ../
}

node_layer "$1"
