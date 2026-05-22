1: 
   i)  npm install
   ii) node server.js
   Nothing else needed to be installed

2: 
  Reason of stack/platform choice:
    CLI would have been easier, but less intuitive for extra features. Desktop App and Mobile apps are a bit difficult 
    when it comes to arranging their dependencies, web app is easier to run on most machines and due to wide usage it provides more intuitive designs to be built more easily.
    Plus I didnt use any unneeded frameworks to buid this, all close to bare metal.

3: 
   I have used an array of fields that can be updated for a card, when a request is sent to backend. I have made sure no
   illegal field, i mean a note's id which is crucial to be protected, cant be changed.
   In dbFunctions.js file, line 40 a function called updateCard has a list of allowed fields to be altered and it wont accept any field accept the legal ones mentioned inside the array.
   Without this, a note's id could be changed, crashing the app, if this is applied at database level, even then the operation would fail, giving an error, I have avoided that by only cherry picking the right requests from the user.

4:
   I used AI to help me avoid the heavy frameworks that instantly create all the extra boiler plates and directories, I also asked for help in creating the frontend. In creating the quiz mode I changed its code, to add that extra functionality and altered it in database schema as well.


5:
   User accounts, its just a web app for local usage, but to have it function for multiple users, I must have user accounts and authentication setup. Thats a really needed fix