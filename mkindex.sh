#! /bin/bash

ROOT_DIR=$1
DIR=${ROOT_DIR:-"."}

cd "$DIR" || exit 1

find . -type d -exec ls -1d {} \; | sort | while read -r dir
do
    # echo "$dir"
    cd "$dir" || exit 2
    echo -e "<html>\n<body>\n<h1>${dir}</h1>\n<p>" > index.html;
    echo -e "<style>a { line-height: 1.5; } p { padding: 5px 10px }</style>" >> index.html;
    echo -e "<a href=\"..\">..</a><br/>" >> index.html;

    ls -1p | sort | while read -r d
    do
        echo -e "\t$d"
        echo -e "<a href=\"$d\">$d</a><br/>" >> index.html;
    done

    echo -e "</p>\n</body>\n</html>" >> indsex.html;

    cd - || exit 3
done
