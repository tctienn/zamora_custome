#!/bin/sh
echo "Replacing env constants in JS"

keys="VITE_GATEWAY VITE_EDITOR_URL VITE_CHAT_SERVER"

for file in ./assets/index*.js; do
  echo "Processing $file ..."
  for key in $keys; do
    value=$(eval echo \$"$key")
    echo "replace \$$key by $value"
    sed -i 's#'"\$$key"'#'"$value"'#g' "$file"
  done
done

exec "$@"
