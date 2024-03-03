# cncjs-pendant-xHB04B

A simple CNCjs pendant based on a USB 4/6-axis xHB04B-4 Manual Pulse Generator pendant.

![LHB04B-4 pendant](https://m.media-amazon.com/images/W/MEDIAX_849526-T3/images/I/712VRMLuGwL._AC_SL1500_.jpg)

## Installation

After cloning the repository to your work directory, change into this directory and run
```
npm install
```

On linux, make sure you have installed the following packages
```
libusb-1.0-0-dev
libudev-dev
```
These can be installed with apt-get.

## Usage

Run `bin/cncjs-pendant-LHB04B-4` to start. Pass `--help` to `cncjs-pendant-LHB04B-4` for more options.

```
bin/cncjs-pendant-LHB04B-4 --help
```

### Notes
* To figure out the random socket.io listening port used to communicate with the CNCjs server, select `View in browser` from the `View` menu
* If running on the same machine as the server, the secret key will automatically be extracted from the `.cncrc` file (why is this not `.cncjsrc`?!?)
* `--list` will list the _local_ serial ports, not the server's serial ports. WTF.

Hotkeys:

![Hotkeys](https://raw.githubusercontent.com/repentsinner/cncjs-pendant-xhb04b/master/docs/keysinfo.png)
