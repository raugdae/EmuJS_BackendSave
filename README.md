# Introduction
This project is a freetime projet with Zad-sixstrings for holiday period. Working together on **EmulatorJS**. Zad making the Frontend with a brand new visual theme. On my side, i'm building a a Backend node.js app to implement saving of the game on a PostgreSQL server

# Who's this for?
This is basically for us to play around and having some "fun" coding. But its also free to anyone who want to implement it on their side. Full documentation will be made in the futur.

# How it will work?
Use a PostgreSQL database for hosting users, games informations, save file, devices,...  
Use à Node.JS app to provide multiple API to communicate between **EmulatorJS** and the **PostgreSQL** database

# What's the actual status
Actually the backend stuff is still in dev. There still a lot of functionnality to integrate.

# Roadmap
- [x] Saving file on a Table through an API  
- [x] Loading file from a Table through an API
- [ ] Implement user authentification  
- [ ] Implement user profile data

*and many more to come*

# Prerequisits
As for today, there is no packaged app solution.
I'll describe the environnement i'm working with. It was designed to work with the frontend developped by Zad-Sixstring 

## SERVER
Debian 12 server in CLI Mode with these packages :
- PostgreSQL V17.2 database
- NFS (client/server)
- FTP Server
- NodeJS

## DATABASE
PostgreSQL V17.2  
*A script for the table creation will come in the future, for now you can find here the structure of the DATABASE*  
**achievement**  
|column name | type | Default value | Primary | constrained to | Description |
|------------|------|---------------|---------|----------------|-------------|
| id | UUID | gen_random_uuid() | yes | | Unique ID of record |
| memorylocation | bigint | | | | array position in savefile (8BitArray)|
| achievementname | text | | | | Title of the achievement |
| achievementpic | text | | | | Path to the achievement picture |
| waitedvalue | integer | | | | Value to find at memorylocation |
| sizeinram | integer | | | | size of waitedvalue in RAM (8bitArray)|
| description | text | | | | Description of the achievement |
| achievementcondition | text | | | | condition of achievement |
| rangeinram | integer | | | | Some achievement can be calculated on a range |
| totalvalue | integer | | | | Totale value for some condition of achievement |
| fk_gamelist | UUID | | | gamelist.id | foreign key of gamelist table |


**device**  
|column name | type | Default value | Primary | constrained to | Description |
|------------|------|---------------|---------|----------------|-------------|
| id | UUID | gen_random_uuid() | yes | | Unique ID of record |
| name | text | | | | Console name|
| shortname | text | | | | Shortname of console (GB/SNES/SMG)|
| builder | text | | | | Builder of the device |


**gamelist**
|column name | type | Default value | Primary | constrained to | Description |
|------------|------|---------------|---------|----------------|-------------|
| id | UUID | gen_random_uuid() | yes | | Unique ID of record |







# Disclaimer
We do ***not*** provide any ROM of game, neither we promot IP violation. provide your own ROM file from dumped cartridges or any **legal** channel.<br>
I'm also not a professional coder, code may have error, security issue,... Bear in mind i cannot be held as responsible if any critical data have been compromised (hacked, encrypted, stolen,...)
