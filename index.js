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
const fs = require("fs"),
	path = require("path"),
	child_process = require("child_process"),
	VMTConvert = require("node-vmt-parser"),
	vmat_template = fs.readFileSync(__dirname+"\\vmat_template.vmat","utf-8"), // template vmat to replace keywords inside of
	// half life: source substrings, in case the textures aren't correctly applied - this may not be a good idea in long term!
	// TODO: are these correct?
	substrings = [ 
		"-9",
		"-8",
		"-7",
		"-6",
		"-5",
		"-4",
		"-3",
		"-2",
		"-1",
		"-0",
		"+0",
		"+1",
		"+2",
		"+3",
		"+4",
		"+5",
		"+6",
		"+7",
		"+8",
		"+9",
		"+a"
	];
// parses vmt files 'asynchronously'
// file is a direct path to a vmt, argv is a required command line argument array (minimist is included, required params are "input", "output", and "vtfcmd")
function parse(file, argv) {
	VMTConvert.parseVMT(file).then((retArr) => {
		var vmt = file.replace(path.dirname(argv.input)+"\\","").replace(".vmt","").replace("materials\\","")
		const dirs = path.format(path.parse(argv.output+"\\"+vmt.replace(path.basename(file.replace(".vmt", "")), "").replace(/\//g,"\\")))
		var vmat = vmat_template
		// optionally replace the default shader
		// --shader="example.vfx"
		if(argv.shader) vmat = vmat.replace("vr_simple.vfx",argv.shader)
		if(!fs.existsSync(dirs)) fs.mkdirSync(dirs, { recursive: true })
		// albedo maps
		if(retArr.basetexture && !argv.color) {
			vmat = vmat.replace("default/default_color",retArr.basetexture+"_color").replace(/\\/g,"/")
			vtfparse(retArr.basetexture, "_color", argv)
		}
		// normal maps
		if(retArr.bumpmap && !argv.rough) {
			vmat = vmat.replace("default/default_normal",retArr.basetexture+"_normal").replace(/\\/g,"/")
			vtfparse(retArr.bumpmap, "_normal", argv)
		}
		// roughness maps
		// source does not have roughness maps, this code may never be used
		if(retArr.roughness && !argv.normal) {
			vmat = vmat.replace("default/default_rough",retArr.basetexture+"_rough").replace(/\\/g,"/")
			vtfparse(retArr.bumpmap, "_rough", argv)
		}
		// overrides
		if(argv.color) vmat = vmat.replace("default/default_color",argv.color).replace(/\\/g,"/")
		if(argv.rough) vmat = vmat.replace("default/default_rough",argv.rough).replace(/\\/g,"/")
		if(argv.normal) vmat = vmat.replace("default/default_normal",argv.normal).replace(/\\/g,"/")
		// substrings are just renamed vmats, let's just rewrite our current vmap
		if(!argv.novmt) {
			if(argv.substring == true) {
				for(var e=0; e < substrings.length; e++) {
					if(vmt.includes(substrings[e])) {
						if(!fs.existsSync(argv.output+"\\"+vmt.replace(substrings[e],"")+".vmat") || argv.overwrite) {
							fs.writeFileSync(argv.output+"\\"+vmt.replace(substrings[e],"")+".vmat",vmat)
							if(!argv.silent) console.log(vmt.replace(substrings[e],"")+".vmt -> "+vmt.replace(substrings[e],"")+".vmat")
						}
					}
				}
			}
			// finally, let's write the vmat
			if(!fs.existsSync(argv.output+"\\"+vmt+".vmat") || argv.overwrite) {
				fs.writeFileSync(argv.output+"\\"+vmt+".vmat",vmat)
				if(!argv.silent) console.log(vmt+".vmt -> "+vmt+".vmat")
			}
		}
	}).catch((err) => {
		if(!argv.silent) console.error(err)
		return false;
	}).finally(() => {
		return true;
	})
}
// this looks really ugly but it works as-is
// basetexture is a direct path to a vtf, suffix is a source 2 texture suffix (such as "_color"), argv is a required command line array (minimist is included, required params are "input", "output", and "vtfcmd")
// TODO: are some of these string replacements nessecary?
function vtfparse(basetexture, suffix, argv) {
	if(!argv.novtf) {
		const vtf = basetexture.replace(/\//g,"\\")
		const out = (argv.input+"\\"+vtf+".vtf")
		const dirs2 = path.dirname(path.format(path.parse(argv.output+"\\"+vtf+".vtf")))
		if(!fs.existsSync(dirs2)) fs.mkdirSync(dirs2, { recursive: true }) // file structure is usually never here so just being safe
		const args = [argv.vtfcmd, out, dirs2]
		if(fs.existsSync(out) && (!fs.existsSync((argv.output+"/"+vtf+suffix+".tga").replace(/\\/g,"/")) || argv.overwrite)) {
			const ex = child_process.spawnSync(__dirname+"\\start.bat",args, // yep that's a batch file, vtfcmd does **not** work with child_process for some reason
			{
				stdio: 'pipe',
				encoding: 'utf-8'
			})
			
			if(argv.debug && ex.output) {
				for(var i = 0; i < ex.output.length; i++) {
					if(ex.output[i] && !argv.silent) console.log(ex.output[i])
				}
			} else if(!ex.output) {
				if(!argv.silent) console.error("VTFCmd batch file could not be executed!")
				return false;
			}
			
			if(fs.existsSync((argv.output+"/"+vtf+".tga").replace(/\\/g,"/")))
			{
				fs.renameSync((argv.output+"/"+vtf+".tga").replace(/\\/g,"/"), (argv.output+"/"+vtf+suffix+".tga").replace(/\\/g,"/"))
				if(!argv.silent) console.log(vtf+".vtf -> "+vtf+suffix+".tga")
			}
		}
		return true;
	} else {
		return false;
	}
}

module.exports = {
	parse: parse,
	vtfparse: vtfparse
}
