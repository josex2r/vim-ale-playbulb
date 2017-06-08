# vim-ale-playbulb

## Sniffing bluetooth

You can enable this by going to Settings->Developer Options, then checking the box next to 
**"Bluetooth HCI Snoop Log"**.
Once this setting is activated, Android will save the packet capture to `/sdcard/btsnoop_hci.log`
to be pulled and inspected.

Type the following in case `/sdcard/` is not the right path on your particular device:

`$ adb shell echo \$EXTERNAL_STORAGE`

Finding the log file path:

`$ adb shell "cat /etc/bluetooth/bt_stack.conf | grep FileName"`

Retrieve the log

`$ adb pull /sdcard/btsnoop_hci.log`

Inspect it with Wireshark or another tool.

## Checking the Playbulb protocol

[Protocol](https://github.com/Phhere/Playbulb)

The next image shows the packet that change the name of the lamp to "PLAYBULB", check the packet data:

* Address: `0x001c`
* Service: `0xffff`
* Value: `504c415942554c42` (**PLAYBULB**)

![wireshark](assets/wireshark.png)

