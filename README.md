# cncjs-pendant-LHB04B-4

A simple CNCjs pendant based on a USB 4-axis LHB04B-4 Manual Pulse Generator pendant.

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

Run `bin/cncjs-pendant-LHB04B-4` to start. Pass --help to `cncjs-pendant-LHB04B-4` for more options.

```
bin/cncjs-pendant-LHB04B-4 --help
```

Hotkeys:

![Hotkeys](https://raw.githubusercontent.com/nsfilho/cncjs-pendant-keyboard/master/docs/keysinfo.png)
