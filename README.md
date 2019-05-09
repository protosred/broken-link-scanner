# Broken Link Scanner

Simple tool for checking broken links on a list of web pages. Simply provide a CSV file with URLs and it will scan all links on them if they are broken (status code: 40X, 50X).

![functionality demo](https://www.protos.red/static/broken-link-scanner/recording.gif)

**Official Page**
https://www.protos.red/broken-link-scanner

**Part of a "One bot per day" series on /r/bigseo subreddit**
https://www.reddit.com/r/bigseo/comments/bm59lq/broken_link_scanner_onebotperday_110/

## To compile binaries:
- Install Node.js 8.1.1
- Install pkg (from zeit): npm install -g pkg
- Run: npm install
- Run: npm run compile
- Binaries will be in the bin folder

## Download (pre-compiled binaries)

- [Windows 7+](https://files.protos.red/broken-link-scanner/win32/broken-link-scanner.exe)
- [MacOS](https://files.protos.red/broken-link-scanner/macos/broken-link-scanner)
- [Linux - gnome-terminal is required](https://files.protos.red/broken-link-scanner/linux/broken-link-scanner)