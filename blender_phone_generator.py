"""
AR Mobile Teardown System - Blender Procedural Phone Generator & GLB Exporter
Generates a realistic procedural smartphone with separate component hierarchies and exports GLB.
Run inside Blender: blender --background --python blender_phone_generator.py
"""

import bpy
import math

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def create_material(name, color, metallic=0.0, roughness=0.5, transmission=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (*color, 1.0)
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Roughness'].default_value = roughness
        if 'Transmission Weight' in bsdf.inputs:
            bsdf.inputs['Transmission Weight'].default_value = transmission
        elif 'Transmission' in bsdf.inputs:
            bsdf.inputs['Transmission'].default_value = transmission
    return mat

def create_phone():
    clear_scene()

    # Materials
    mat_frame = create_material("Mat_Frame", (0.15, 0.16, 0.18), metallic=0.9, roughness=0.2)
    mat_glass = create_material("Mat_BackGlass", (0.05, 0.08, 0.12), metallic=0.1, roughness=0.1, transmission=0.8)
    mat_screen = create_material("Mat_Screen", (0.01, 0.01, 0.02), metallic=0.0, roughness=0.1)
    mat_battery = create_material("Mat_Battery", (0.1, 0.1, 0.1), metallic=0.2, roughness=0.4)
    mat_pcb = create_material("Mat_Motherboard", (0.02, 0.08, 0.04), metallic=0.3, roughness=0.3)
    mat_copper = create_material("Mat_CopperCoil", (0.72, 0.45, 0.2), metallic=0.95, roughness=0.25)

    root = bpy.data.objects.new("Phone_Root", None)
    bpy.context.collection.objects.link(root)

    # 1. Frame
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    frame = bpy.context.active_object
    frame.name = "frame"
    frame.scale = (0.76, 1.62, 0.085)
    frame.data.materials.append(mat_frame)
    frame.parent = root

    # Bevel modifier for rounded edges
    bev = frame.modifiers.new("Bevel", type='BEVEL')
    bev.width = 0.04
    bev.segments = 4

    # 2. Back Glass Panel
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.045))
    back = bpy.context.active_object
    back.name = "back_panel"
    back.scale = (0.75, 1.61, 0.01)
    back.data.materials.append(mat_glass)
    back.parent = root

    # 3. Screen
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.045))
    screen = bpy.context.active_object
    screen.name = "screen"
    screen.scale = (0.74, 1.60, 0.008)
    screen.data.materials.append(mat_screen)
    screen.parent = root

    # 4. Battery
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.25, 0))
    battery = bpy.context.active_object
    battery.name = "battery"
    battery.scale = (0.58, 0.85, 0.038)
    battery.data.materials.append(mat_battery)
    battery.parent = root

    # 5. Motherboard
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.45, 0))
    mb = bpy.context.active_object
    mb.name = "motherboard"
    mb.scale = (0.68, 0.55, 0.02)
    mb.data.materials.append(mat_pcb)
    mb.parent = root

    # 6. Wireless Charging Coil
    bpy.ops.mesh.primitive_torus_add(major_radius=0.22, minor_radius=0.015, location=(0, -0.15, -0.02))
    coil = bpy.context.active_object
    coil.name = "wireless_coil"
    coil.data.materials.append(mat_copper)
    coil.parent = root

    # 7. Camera Module
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.2, 0.5, -0.055))
    cam = bpy.context.active_object
    cam.name = "camera_module"
    cam.scale = (0.28, 0.45, 0.025)
    cam.data.materials.append(mat_frame)
    cam.parent = root

    print("[SUCCESS] Procedural Phone Model built successfully.")

def export_glb(output_path="phone_model.glb"):
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=False
    )
    print(f"[EXPORT] Phone exported to {output_path}")

if __name__ == "__main__":
    create_phone()
    # export_glb()
