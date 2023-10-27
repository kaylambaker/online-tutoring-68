# endpoints

## /tutors

### get /tutors - retrieve list of all tutors

request parameters
 
+ none
 
body parameters
 
+ none
 
returns
 
+ on success, status code 200 and list of tutors
+ on failure, status code 200 and error message

### delete /tutors/:ID - delete tutor identified by ID

request parameters
 
+ user ID
 
body parameters
 
+ none
 
returns
 
+ on success, status code 200 and message 'tutors profile has been deleted succeffully.'
+ on failure, status code 200 and error message

### put /tutors/:id - update information of the student identified by id

request parameters
 
+ user ID
 
body parameters
 
+ Bio
+ Subject
+ AvailableHoursStart
+ AvailableHoursEnd
+ FirstName
+ LastName
+ HashedPassword
+ HoursCompleted
+ ProfilePictureID
 
returns
 
+ on success, status code 200 and sql message
+ on failure, status code 400 and error message

### post /tutors - inserts a new tutor into the database

request parameters
 
+ none
 
body parameters
 
+ Email
+ FirstName
+ LastName
+ password
+ HoursCompleted
+ ProfilePictureID
+ IsTutor
 
returns
 
+ on success, status code 200 and sql message for inserting into tutors table
+ on failure, status code 400 and error message

### get /tutors/:id - retrieves a tutor identified by id

request parameters
 
+ user ID
 
body parameters
 
+ none
 
returns
 
+ on success, 1 tutor object with attributes ID, Email, FirstName, LastName, HoursCompleted,ProfilePictureID, IsTutor, Bio, Subject, AvailableHoursStart, AvailableHoursEnd
+ on failure
    + if there are no tutors with the given ID, status code 404 and message 'user not found'
        + if there is an error, status code 500 and error message
    + if there are other errors, status code 500 and error message

### get /tutors - returns list of all tutors

request parameters
 
+ none
 
body parameters
 
+ none
 
returns
 
+ on success, status code 200 and sql message
+ on failure, status code 200 and sql message

### delete /tutors/:ID - delete tutor identified by ID

request parameters
 
+ user ID
 
body parameters
 
+ none
 
returns 
 
+ on success, status code 200 and message 'tutors profile has been deleted succeffully.'
+ on failure, status code 200 and error message

## /students

### put /students/:id - update information of the student identified by id

request parameters
 
+ user ID
 
body parameters
 
+ FirstName
+ LastName
+ HashedPassword
+ HoursCompleted
+ ProfilePictureID
 
returns
 
+ on success, status code 200 and sql message
+ on failure, status code 500 and error message

### post /students - insert new student into database

request parameters
 
+ none
 
body parameters
 
+ Email
+ FirstName
+ LastName
+ password
+ HoursCompleted
+ ProfilePictureID
+ IsTutor
 
returns
 
+ on success, status code 201 and sql message for inserting into student table
+ on failure, status code 400 error message

### get /students/:id - get student identified by id

request parameters
 
+ user ID
 
body parameters
 
+ none
 
returns 
 
+ on success, 1 student object with attributes ID,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor 
+ on failure
    + if there are no students with the given ID, status code 404 and message 'user not found'
    + if there is an error, status code 500 and error message
    
# /students/favorites_list

### get /students/favorites_list/:StudentID - retrieve favorites list of student identified by StudentID

request parameters
 
+ StudentID
 
body parameters
 
+ none
 
returns
 
+ on success, status code 200 and student's favorites list
    + each list entry has StudentID,TutorID,tutor's Bio,tutor's Subject,tutor's AvailableHoursStart,tutor's AvailableHoursEnd
+ on failure, status code 500 and error message
     
### post /students/favorites_list/:StudentID/:TutorID - adds tutor identified by TutorID to the favorites list of student identified by StudentID

request parameters
 
+ StudentID
+ TutorID
 
body parameters
 
+ none
 
returns
 
+ on success, status code 200 and sql message
+ on failure, status code 500 and error message

### delete /students/favorites_list/:StudentID/:TutorID - remove tutor identified by TutorID from the favorites list of student identified by StudentID

request parameters
 
+ StudentID
+ TutorID
 
body parameters
 
+ none
 
returns
 
+ on success, status code 200 and sql message
+ on failure, status code 500 and error message

## /users

### get /users/:Email/:Password - get user identified by Email and Password

request parameters

* Email
* Password

body parameters

* none

returns

* on success, 1 user object with attributes ID,Email,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor
* on failure
    + if there is no user with the given Email, status code 404 and message 'user not found'
    + if the given password is incorrect, status code 401 and message 'invalid password'
    + if other errors, status code 500 and error message

## /users/profile_picture

### put /users/profile_picture/:id - updates profile picture of user identified by id, the file is put in path backend/images/\<user ID>.\<file extension>

request parameters
 
+ user ID
 
body parameters
 
+ none
 
returns
 
+ on success, status code 200 and sql message for updating a users ProfilePictureID
+ on failure, status code 500 and error message
     
### delete /users/profile_picture/:id - deletes profile picture of user identified by id

request parameters
 
+ user ID
 
body parameters
 
+ none
 
returns
 
+ on success, status code 200 and sql message for updating a users ProfilePictureID
+ on failure, status code 500 and error message

## /appointments

### get /Appointments - retrieve all appointments from the database

request parameters
 
+ none
 
body parameters
 
+ none
 
returns
 
+ on success, status code 200 and the list of appointments
+ on failure, status code 200 and the error message

### delete /appointments/:id - delete appointment identified by id

request parameters
 
+ appointment ID
 
body parameters
 
+ none
 
returns
 
+ on success, status 200 and success: true
+ on failure, status code 500 and error: 'Error deleting appointment' 

### get /appointments/:id - get appointment identified by id

request parameters
 
+ appointment ID
 
body parameters
 
+ none
 
returns
 
+ on success, status 200 and list of appointments
+ on failure, status code 500 and error: 'Error deleting appointment' 

### get /appointments/tutor/:id - get appointments for tutor identified by id

request parameters

+ tutor ID
 
body parameters
 
+ none
 
returns
 
+ on success, status 200 and list of appointments
+ on failure, status code 500 and error: 'Error in the appointment' 

### delete /appointments/tutor/:id - delete appointments for tutor identified by id

request parameters
 
+ tutor ID
 
body parameters
 
+ none
 
returns
 
+ on success, status 200 and success: true
+ on failure, status code 500 and error: 'Error deleting appointment' 

### get /appointments/student/:id - get appointments for student identified by id

request parameters
 
+ student ID
 
body parameters
 
+ none
 
returns
 
+ on success, status 200 and list of appointments
+ on failure, status code 500 and error: 'Error in the appointment' 

### delete /appointments/student/:id - delete appointments for student identified by id

request parameters
 
+ student ID
 
body parameters
 
+ none
 
returns
 
+ on success, status 200 and success: true
+ on failure, status code 500 and error: 'Error deleting appointment' 

# create-tables.sql

the create-tables.sql file can be run in a local instance of mysql to create the database schema

# test-data.js

test-data.js can be run using node from the command line. test-data.js populates the database with test data using bcrypt to encrypt the passwords. All of the test users have the password of 'password'. to run the script type ```node test-data.js``` into the command line
