create table if not exists Users (
  ID int primary key auto_increment,
  Email varchar(255) not null unique,
  FirstName varchar(255) not null,
  LastName varchar(255) not null,
  HashedPassword varchar(200) not null,
  HoursCompleted int not null,
  ProfilePictureID varchar(255),
  IsTutor boolean not null,
  TOTPEnabled boolean not null default false,
  TOTPSecret varchar(100),
  TOTPTempSecret varchar(100)
);
create table if not exists Students (
  ID int primary key,
  foreign key(ID) references Users(ID) on delete cascade
);
create table if not exists Tutors (
  ID int,
  Bio varchar(400),
  Subject varchar(50) not null,
  AvailableHoursStart time not null,
  AvailableHoursEnd time not null,
  foreign key(ID) references Users(ID) on delete cascade
);
create table if not exists FavoritesList (
  StudentID int not null,
  TutorID int not null,
  primary key(StudentID, TutorID),
  foreign key(StudentID) references Students(ID) on delete cascade,
  foreign key(TutorID) references Tutors(ID) on delete cascade
);
create table if not exists Appointments (
  ID int primary key auto_increment,
  StudentID int not null,
  TutorID int not null,
  AppointmentDate date not null,
  StartTime time not null,
  EndTime time not null,
  Subject varchar(50) not null,
  AppointmentNotes varchar(400),
  MeetingLink varchar(255),
  foreign key(StudentID) references Students(ID) on delete cascade,
  foreign key(TutorID) references Tutors(ID) on delete cascade
);
create table if not exists Criminals (
  FirstName varchar(255) not null,
  LastName varchar(255) not null,
  Email varchar(255) not null unique
);
