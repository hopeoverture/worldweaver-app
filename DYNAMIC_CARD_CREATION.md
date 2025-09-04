# Dynamic Card Creation with Card Type Templates

## Feature Implementation
Enhanced the card creation modal to dynamically populate form fields based on the selected card type's schema, allowing users to fill out template-specific data when creating cards.

## How It Works

### 1. Card Type Selection (Step 1)
- User selects a card type from the visual grid
- Card type contains a schema with field definitions
- System initializes field data with appropriate default values

### 2. Dynamic Form Population (Step 2)
- Form renders with basic card fields (name, folder, summary, cover image)
- **NEW**: Additional section displays fields from the card type's schema
- Each field type renders with appropriate input component
- Field validation based on schema requirements

### 3. Data Persistence
- Card record is created with basic information
- **NEW**: Field data is saved to `card_data` table with field_key and value
- Supports all field types defined in the schema

## Field Type Support

### Implemented Field Types:
- **text**: Single-line text input with optional max length
- **long_text**: Multi-line textarea with optional max length  
- **number**: Numeric input with min/max validation
- **boolean**: Checkbox with descriptive label
- **select**: Dropdown with predefined options
- **multi_select**: Multiple checkboxes for multiple selections
- **date**: Date picker input
- **color**: Color picker with hex input
- **image**: URL input for image references

### Field Properties Supported:
- **required**: Validation for mandatory fields
- **description**: Help text displayed under fields
- **options**: Choice lists for select/multi-select fields
- **validation**: Min/max values for numbers and text length

## Technical Implementation

### State Management
```tsx
const [fieldData, setFieldData] = useState<Record<string, any>>({})

const updateFieldData = (fieldKey: string, value: any) => {
  setFieldData(prev => ({
    ...prev,
    [fieldKey]: value
  }))
}
```

### Field Initialization
```tsx
const handleCardTypeSelect = (cardType: CardType) => {
  // Initialize field data with default values from schema
  const initialFieldData: Record<string, any> = {}
  if (cardType.schema) {
    cardType.schema.forEach(field => {
      switch (field.kind) {
        case 'text': initialFieldData[field.key] = ''; break
        case 'number': initialFieldData[field.key] = field.validation?.min || 0; break
        case 'boolean': initialFieldData[field.key] = false; break
        // ... other types
      }
    })
  }
  setFieldData(initialFieldData)
  setStep('fill-details')
}
```

### Dynamic Field Rendering
```tsx
const renderField = (field: FieldSchema) => {
  const value = fieldData[field.key] || ''
  
  switch (field.kind) {
    case 'text':
      return <Input value={value} onChange={(e) => updateFieldData(field.key, e.target.value)} />
    case 'boolean':
      return <checkbox checked={!!value} onChange={(e) => updateFieldData(field.key, e.target.checked)} />
    // ... other field types
  }
}
```

### Data Persistence
```tsx
// Create card first
const newCard = await supabaseService.card.createCard({ ... })

// Save field data
if (selectedCardType?.schema && Object.keys(fieldData).length > 0) {
  const dataPromises = selectedCardType.schema
    .filter(field => {
      const value = fieldData[field.key]
      return value !== '' && value !== null && value !== undefined && 
             !(Array.isArray(value) && value.length === 0)
    })
    .map(field => 
      supabaseService.card.updateCardData(newCard.id, field.key, fieldData[field.key])
    )
  
  await Promise.all(dataPromises)
}
```

## User Experience

### Before (Basic Card Creation):
- User creates card with only name, summary, and image
- No structured data capture
- No template-specific fields

### After (Template-Based Creation):
- **Step 1**: Visual card type selection with template preview
- **Step 2**: Dynamic form with card type specific fields
- Proper validation for required fields
- Rich field types for different data needs
- Clear field labeling and help text

## UI Components

### Card Type Selection Grid
- Visual cards showing icon, name, description
- Field count indicator
- Color-coded type identification

### Dynamic Form Fields
- Field labels with required indicators
- Appropriate input components per field type
- Validation feedback
- Help text for field descriptions
- Organized in dedicated "Card Type Fields" section

### Form Validation
- Basic card fields (name required)
- Card type selection validation
- Schema-based required field validation
- Type-specific validation (min/max, length limits)

## Database Schema Usage

### Tables Involved:
- **cards**: Basic card information (name, summary, etc.)
- **card_data**: Dynamic field data (field_key, value pairs)
- **card_types**: Template definitions with schema

### Data Structure:
```sql
-- Card record
INSERT INTO cards (world_id, type_id, name, title, summary, ...)

-- Field data entries
INSERT INTO card_data (card_id, field_key, value) VALUES
  ('card-id', 'character_age', '{"value": 25}'),
  ('card-id', 'character_class', '{"value": "Warrior"}'),
  ('card-id', 'is_npc', '{"value": true}')
```

## Files Modified
- `src/components/cards/create-card-modal.tsx`
  - Added dynamic field state management
  - Implemented field rendering for all types
  - Enhanced form submission with field data persistence
  - Added field validation and user experience improvements

## Benefits
- ✅ **Template-driven creation** - Cards inherit structure from card types
- ✅ **Rich data capture** - Support for 9 different field types
- ✅ **Type safety** - Proper TypeScript types for field data
- ✅ **User-friendly** - Clear form with validation and help text
- ✅ **Extensible** - Easy to add new field types in the future
- ✅ **Data integrity** - Only saves non-empty field values

The card creation process now provides a structured, template-based approach that captures rich, typed data specific to each card type while maintaining an intuitive user experience.
