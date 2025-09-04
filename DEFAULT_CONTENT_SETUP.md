# WorldWeaver Default Content Setup

## Overview
This document describes the default folders, card types, and starter cards that every new world gets when created in WorldWeaver.

## Default Folders
Every new world automatically gets 8 organized folders:

1. **Characters** (#3B82F6 - Blue)
   - Main characters, protagonists, and important figures

2. **Locations** (#10B981 - Green) 
   - Places, cities, dungeons, and geographical features

3. **Items & Artifacts** (#8B5CF6 - Purple)
   - Magic items, weapons, artifacts, and important objects

4. **Organizations** (#F59E0B - Orange)
   - Guilds, factions, governments, and groups

5. **Events & History** (#EF4444 - Red)
   - Historical events, timelines, and important moments

6. **Lore & Mythology** (#8B5CF6 - Purple)
   - Creation myths, legends, religions, and cultural lore

7. **NPCs** (#06B6D4 - Cyan)
   - Non-player characters, side characters, and supporting cast

8. **Quests & Plot Hooks** (#F97316 - Orange)
   - Adventure ideas, plot hooks, and story threads

## Default Card Types
Every new world gets 7 comprehensive card types:

### 1. Character
- **Icon**: User | **Color**: #3B82F6
- **Fields**: Race/Species, Class/Profession, Level, Physical Description, Personality, Background/History, Special Abilities, Current Location, Portrait

### 2. Location
- **Icon**: MapPin | **Color**: #10B981
- **Fields**: Location Type, Population, Government Type, Description, Notable Features, Dangers/Threats, Ruler/Leader, Parent Location, Map/Image

### 3. Item/Artifact
- **Icon**: Zap | **Color**: #8B5CF6
- **Fields**: Rarity, Item Type, Requires Attunement, Description, Magical Properties, History/Lore, Current Owner, Item Image

### 4. Organization
- **Icon**: Users | **Color**: #F59E0B
- **Fields**: Organization Type, Size, Influence Level, Description, Goals & Agenda, Allies, Enemies, Leader, Headquarters, Symbol/Heraldry

### 5. Event
- **Icon**: Calendar | **Color**: #EF4444
- **Fields**: Date/Time Period, Event Type, Historical Importance, Description, Key Participants, Consequences & Impact, Location

### 6. NPC
- **Icon**: User | **Color**: #06B6D4
- **Fields**: Role/Occupation, Disposition to Party, Description, Motivation, Secret/Hidden Info, Location, Organization

### 7. Quest
- **Icon**: Target | **Color**: #F97316
- **Fields**: Quest Type, Recommended Level, Status, Description, Objectives, Rewards, Quest Giver, Main Location

## Starter Cards
Every new world comes with 6 example cards to help users get started:

### 1. Getting Started (Event)
- **Folder**: Lore & Mythology
- **Purpose**: Welcome message and tutorial information

### 2. The Protagonist (Character)
- **Folder**: Characters
- **Purpose**: Example main character template

### 3. The Starting Village (Location)
- **Folder**: Locations
- **Purpose**: Example starting location

### 4. The Friendly Innkeeper (NPC)
- **Folder**: NPCs
- **Purpose**: Example helpful NPC

### 5. The Missing Cat (Quest)
- **Folder**: Quests & Plot Hooks
- **Purpose**: Simple starter quest example

### 6. The Great Beginning (Event)
- **Folder**: Lore & Mythology
- **Purpose**: World creation/founding event template

## Implementation
The setup is handled by the `setup_world_defaults()` PostgreSQL function, which is automatically called when a new world is created through the `worldService.createWorld()` method.

### Key Features:
- **Automatic Setup**: Runs whenever a new world is created
- **Customizable**: Users can immediately edit or delete any default content
- **Educational**: Provides examples of how to structure content
- **Comprehensive**: Covers all major worldbuilding categories
- **Color-Coded**: Each folder has a distinct color for easy organization

## Benefits for Users:
1. **Immediate Structure**: No empty world - users have a framework to build on
2. **Learning Tool**: Examples show how to use the system effectively
3. **Time Saving**: Don't need to create basic folders and types from scratch
4. **Best Practices**: Organized structure encourages good worldbuilding habits
5. **Inspiration**: Starter cards provide ideas and templates for content creation
