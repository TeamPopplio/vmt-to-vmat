#!/usr/bin/env node
/*
	Copyright (C) 2021 KiwifruitDev

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/
const argv = require('minimist')(process.argv.slice(2)), // command line arguments
    recursive = require("./recursive-readdir"),
	startTime = Date.now(),
    vmttovmat = require("./index");

if(argv.vtfcmd == undefined && !argv.novtf) return console.error("You must specify the path to the vtfcmd executable with --vtfcmd=<path>.")
if(argv.output == undefined) return console.error("You must specify the output folder (S2 materials) with --output=<path>.")
if(argv.input == undefined) return console.error("You must specify the input folder (S1 materials) with --input=<path>.")
else {
	recursive(argv.input, function(err, results) {
		if (err) throw err;
		for(var i=0;i < results.length; i++) {
			if(results[i].endsWith(".vmt")) {
				vmttovmat.parse(results[i], argv)
			}
		}
		const endTime = Date.now(),
		completedTime = endTime-startTime;
		if(!argv.silent) console.log("Completed in "+completedTime+"ms.") // TODO: I think this has bad timing sometimes, needs to be fixed
	})
}
