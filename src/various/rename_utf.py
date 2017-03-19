# coding=utf-8
import os
import glob
import urllib.parse as up


def rename_utf(directory='', recursive=False):
    # print(directory, recursive)
    i = 0
    for filename in glob.iglob(directory + '**', recursive=recursive):
        # print(filename)
        # print(up.unquote(filename))
        os.rename(filename, up.unquote(filename))
        i += 1
        # if i == 3: break


if __name__ == "__main__":
    import sys
    # print(sys.argv)
    rename_utf(*sys.argv[1:])
