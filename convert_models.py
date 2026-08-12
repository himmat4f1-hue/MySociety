#!/usr/bin/env python3
"""
Mongoose to Sequelize Model Converter
Converts MongoDB Mongoose models to PostgreSQL Sequelize models automatically
"""

import os
import re
import sys

MODELS_DIR = "/workspaces/MySociety/backend/models"

# Mapping of Mongoose types to Sequelize types
TYPE_MAPPING = {
    "String": "DataTypes.STRING",
    "Number": "DataTypes.INTEGER",
    "Boolean": "DataTypes.BOOLEAN",
    "Date": "DataTypes.DATE",
    "mongoose.Schema.Types.ObjectId": "DataTypes.UUID",
    "Array": "DataTypes.JSON",
    "Mixed": "DataTypes.JSON",
}

MONGOOSE_TEMPLATE = '''const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const {MODEL_NAME} = sequelize.define('{MODEL_NAME}', {{
{FIELDS}
}}, {{
  timestamps: true,
}});

module.exports = {MODEL_NAME};
'''

def extract_field_info(field_def):
    """Extract field name and configuration from mongoose field"""
    # Match pattern: name: { type: String, ... }
    match = re.match(r'(\w+):\s*({[^}]+}|[^,}]+)', field_def.strip())
    if not match:
        return None, None
    
    field_name = match.group(1).strip()
    field_config = match.group(2).strip()
    
    return field_name, field_config

def parse_field_config(config):
    """Parse mongoose field configuration to Sequelize format"""
    
    if config.startswith('{'):
        # Complex config
        type_match = re.search(r'type:\s*(\w+(?:\.\w+)*)', config)
        if not type_match:
            return None
        
        mongoose_type = type_match.group(1)
        sequelize_type = TYPE_MAPPING.get(mongoose_type, "DataTypes.STRING")
        
        # Check properties
        is_required = 'required: true' in config
        is_unique = 'unique: true' in config
        default_match = re.search(r"default:\s*([^,}]+)", config)
        default_value = default_match.group(1).strip() if default_match else None
        
        # Check enum
        enum_match = re.search(r"enum:\s*\[([^\]]+)\]", config)
        if enum_match:
            enum_values = [e.strip().strip("'\"") for e in enum_match.group(1).split(',')]
            sequelize_type = f"DataTypes.ENUM({', '.join(repr(e) for e in enum_values)})"
        
        config_obj = f"""{{
    type: {sequelize_type},"""
        
        if is_required:
            config_obj += f"\n    allowNull: false,"
        else:
            config_obj += f"\n    allowNull: true,"
        
        if is_unique:
            config_obj += f"\n    unique: true,"
        
        if default_value and default_value != 'null':
            config_obj += f"\n    defaultValue: {default_value},"
        
        config_obj += "\n  }"
        
        return config_obj
    else:
        # Simple type
        sequelize_type = TYPE_MAPPING.get(config.strip(), "DataTypes.STRING")
        return f"{{ type: {sequelize_type}, allowNull: true }}"

def convert_mongoose_model(mongoose_content, model_name):
    """Convert Mongoose model to Sequelize format"""
    
    # Extract schema definition
    schema_match = re.search(
        r'new\s+mongoose\.Schema\s*\(\s*({[^}]+(?:{[^}]+}[^}]*)*})',
        mongoose_content,
        re.DOTALL
    )
    
    if not schema_match:
        print(f"⚠️  Could not parse schema for {model_name}")
        return None
    
    schema_def = schema_match.group(1)
    
    # Extract individual fields
    fields_section = ""
    
    # Split by field definitions more carefully
    field_pattern = r'(\w+):\s*({[^}]*(?:{[^}]*}[^}]*)*}|[^,}]+)'
    matches = list(re.finditer(field_pattern, schema_def))
    
    sequelize_fields = []
    
    for match in matches:
        field_name = match.group(1)
        field_config = match.group(2)
        
        if field_name in ['timestamps', 'timestamps:']:
            continue
        
        # Skip nested schemas for now
        if field_config.count('{') > 1:
            print(f"  ℹ️  Skipping complex nested field: {field_name}")
            continue
        
        parsed = parse_field_config(field_config)
        if parsed:
            sequelize_fields.append(f"  {field_name}: {parsed}")
    
    # Handle UUID primary key
    sequelize_fields.insert(0, """  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  }""")
    
    fields_section = ",\n".join(sequelize_fields)
    
    # Generate Sequelize model
    sequelize_model = MONGOOSE_TEMPLATE.format(
        MODEL_NAME=model_name,
        FIELDS=fields_section
    )
    
    return sequelize_model

def convert_all_models():
    """Convert all Mongoose models in the models directory"""
    
    if not os.path.exists(MODELS_DIR):
        print(f"❌ Models directory not found: {MODELS_DIR}")
        return
    
    model_files = [f for f in os.listdir(MODELS_DIR) if f.endswith('.js')]
    
    print(f"\n🚀 Starting conversion of {len(model_files)} models...\n")
    
    converted = 0
    failed = 0
    
    for model_file in sorted(model_files):
        model_name = os.path.splitext(model_file)[0]
        model_path = os.path.join(MODELS_DIR, model_file)
        
        print(f"Converting: {model_name}...", end=" ")
        
        try:
            with open(model_path, 'r') as f:
                mongoose_content = f.read()
            
            # Skip if already converted
            if 'sequelize.define' in mongoose_content:
                print("✅ Already converted")
                converted += 1
                continue
            
            converted_model = convert_mongoose_model(mongoose_content, model_name)
            
            if converted_model:
                with open(model_path, 'w') as f:
                    f.write(converted_model)
                print("✅ Converted")
                converted += 1
            else:
                print("⚠️  Skipped")
                failed += 1
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            failed += 1
    
    print(f"\n{'='*50}")
    print(f"✅ Conversion Complete!")
    print(f"   Converted: {converted}")
    print(f"   Failed/Skipped: {failed}")
    print(f"{'='*50}\n")
    print("⚠️  IMPORTANT: Review all converted models!")
    print("   - Check relationships/references")
    print("   - Verify enums and defaults")
    print("   - Update controllers if needed")

if __name__ == "__main__":
    convert_all_models()
