
if (test-path  ".\output") {
    new-folder  ".\output\" -force
}
if (test-path  ".\output\balderdash-utilities-plugin.zip") {
    remove-item ".\output\balderdash-utilities-plugin.zip" -force
}
copy-item .\main.js $env:destination1 -force
copy-item .\manifest.json $env:destination1 -force
copy-item .\styles.css $env:destination1 -force
if ($env:destination2) {
    Compress-Archive -Path @(".\manifest.json", ".\styles.css", ".\main.js") -DestinationPath ".\.output\balderdash-utilities-plugin.zip" -Force
    copy-item ".\.output\balderdash-utilities-plugin.zip" $env:destination2 -force
}