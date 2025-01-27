#/bin/bash
cd "$(dirname "$0")"

declare -a lang_array=("python" "typescript")
declare -a source_files=("DatabaseDocument" "DatabaseIOStateDocument" "ROSIOState")

for source in "${source_files[@]}"
do
    echo "Generating code for $source..."
    for lang in "${lang_array[@]}"
    do
        if [ "$lang" = "python" ]; then
            quicktype --src "$source".json --src-lang schema --lang $lang --python-version 3.7 --out "$source".py --just-types    
        fi

        if [ "$lang" = "typescript" ]; then
            quicktype --src "$source".json --src-lang schema --lang $lang --out "$source".tsx   
        fi

    done
done