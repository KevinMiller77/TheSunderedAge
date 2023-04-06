filepath = "Lands/"
fileName = "The Sundered Age - Lands.yml"
file = open(filepath + fileName)
fileLines = file.readlines()

outCreatures = []
currentCreature = ""
currentCreatureName = ""
for line in fileLines:
    if line.startswith("Name:"):
        if (currentCreature != ""):
            outCreatures.append([currentCreatureName, currentCreature])
            currentCreature = ""

        name = line[len("Name: "):].strip()
        currentCreatureName = name
        currentCreature = currentCreature + name + ". "
        print("Found creature: ", name)
        continue

    if line.startswith("Card Type:"):
        type = line[len("Card Type: "):].strip()
        currentCreature = currentCreature + type + ". "
        continue

    if line.startswith("Type:"):
        type = line[len("Type: "):].strip()
        currentCreature = currentCreature + type + ". "
        continue

if currentCreature != "":
    outCreatures.append([currentCreatureName, currentCreature])
    currentCreature = ""

file.close()
file = open("test", "w+")
for creature in outCreatures:
    outStr = "Magic: the Gathering. " + creature[1] + "\n"
    file.write(outStr)

file.close()