# vmt-to-vmat

This CLI Node.js application converts the .vmt and .vtf data from Source engine games to basic .vmat data and .tga images respectively for Source 2.

The tool was designed to make [importing Source engine .vmf map data into Source 2](https://developer.valvesoftware.com/wiki/Half-Life:_Alyx_Workshop_Tools/Importing_Source_1_Maps) a lot easier as the material data is not kept persistent.

## Installation / Updating

```
npm install TeamPopplio/vmt-to-vmat -g
```

## Usage:

This application is currently Windows only!

The command below will recursively find the material data in ``C:\Program Files (x86)\Steam\steamapps\common\Half-Life Alyx\game\hl1\materials`` (Source 1 material data, see VDW link above) and outputs their proper counterpart to ``C:\Program Files (x86)\Steam\steamapps\common\Half-Life Alyx\content\hlvr_addons\jmod_import\materials`` (Source 2 material data) using ``C:\vtflib\VTFCmd.exe`` to export the VTF data.

```
vmttovmat --output="C:\Program Files (x86)\Steam\steamapps\common\Half-Life Alyx\content\hlvr_addons\jmod_import\materials" --input="C:\Program Files (x86)\Steam\steamapps\common\Half-Life Alyx\game\hl1\materials" --vtfcmd="c:\vtflib\VTFCmd.exe"
```

## Parameters

* --input
    * Sets the input Source 1 materials directory (Required)
* --output
    * Sets the output Source 2 materials directory (Required)
* --vtfcmd
    * Sets the path to VTFCmd.exe
* --noVMT
    * Disables .vmt conversion
* --novtf
    * Disables .vtf conversion
* --overwrite
    * Overwrite existing files
* --shader
    * Replaces the shader used in the VMAT (Default is "vr_simple.vfx")
* --color
    * Overrides the albedo map material (Default is "materials/default/default_color.tga" or the "$basetexture" parameter)
* --normal
    * Overrides the normal map material (Default is "materials/default/default_normal.tga" or the "$bumpmap" parameter)
* --rough
    * Overrides the roughness map material (Default is "materials/default/default_rough.tga" or the "$roughness" parameter)
    * Note: Roughness maps do not normally exist in Source 1, therefore the default roughness map may be undesirable!
* --debug
    * Enables output for VTFCmd
* --silent
    * Removes all output when executing


## To-do

Special shaders will not carry over, instead ``vr_simple.vfx`` is applied, this can be overrided using the above parameters.

Other VMT-specific options will not carry over, please see ``vmat_template.vmat`` for the default parameters.

## Modules

[node-vmt-parser](https://github.com/LuisFalk/node-vmt-parser/) (A [fork of this](https://github.com/TeamPopplio/node-vmt-parser) is used for better compatibility with Half-Life: Source materials)

[minimist](https://github.com/substack/minimist)
