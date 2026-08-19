RelFam Application Flow
SignUp & Login
Home page of the application
Signup  fields
String : Name
String : Email
Integer : Mobile Number
String : Password
String : Cnfrm Password
Boolean : T&C
Login fields
String : email / phone number
String : password
Integer : OTP

Send one parameter in api calling for identify the enduser entering as a sender or receiver
Parameter : "SENDER", "RECEIVER"



This is for 1st time user login
For user re-login if user logout
Receiver Gift Page


Sender Gift Page

Event_suggesion table
event_name description
Event table






Wedding
 Engagement
 Reception
 Baby Shower
 House Warming
 Naming Ceremony
 Birthday Party
 Anniversary Celebration
 Ear Piercing Ceremony
 Puberty Function
 Seemantham
 Cradle Ceremony
('Wedding', 'Marriage ceremony event'),
('Engagement', 'Pre-wedding engagement function'),
('Reception', 'Wedding reception event'),
('Baby Shower', 'Celebration before baby arrival'),
('House Warming', 'New home celebration'),
('Naming Ceremony', 'Baby naming function'),
('Birthday Party', 'Birthday celebration'),
('Anniversary Celebration', 'Marriage anniversary event'),
('Ear Piercing Ceremony', 'Traditional ear piercing function'),
('Puberty Function', 'Traditional puberty ceremony'),
('Seemantham', 'South Indian baby shower ceremony'),
('Cradle Ceremony', 'Baby cradle celebration')
Long : event_id
Long : user_id
Long : collection_id
String : event_name
String : user_name
String : place
Integer : amount (optional)
String : entry_type
String : transaction_type (send/receive)
String : payment_type
String : payment_status (peding, old, complete, Not yet)
Timestamp : transaction_date
Timestamp : transaction_time 
String : notes
Timestamp : created_at
Timestamp : updated_at




Download

Excel or PDF

This table is only for suggestion 
data of event_type



Profile content
Particular collection record list page
Single record page
Create New Collection Page
Collection List Page
This page for pending records only
Collection table

Long : collection_id
Long : userId
String : collection_name
Boolean : is_active
Timestamp : created_at
Timestamp : updated_at
Status

* Complete
* Pending
* Old
collection means 'Folder'

Status  denotes moi 
amount tally concept
Suggesion Example

2026, Family Events, Friends Events



Collection_suggesion table


Download

Excel or PDF

Family events
Friend's events
2026 - year wise
Neighbour events





FYI - To Frontend team
Take the below page as main page for the Add entry page. 
In cash selection scenario page fields positions need to change as same as main page(UPI selection page - below page). Same as applicable for the beside popup page also.
Purpose : "Add Entry" page
Scenario - From receiver side someone allocate to collected for moi/gift. Receiver side make a note of the moi details into this "Add Entry" page.


Create new event action
This table is only for suggestion 
data of collection

Single record page
This page for pending records only

Receiver invite through this application, the sender will get a notification. If Sender click, its shows the below page
Status

* Complete
* Pending
* Old

Status  denotes moi 
amount tally concept






This entry page design will added in phase1 release

In this page having 2 approaches. 

One is, enter the details and save to draft for future use.

Second one is, On the day of event enduser choose their prefered payment mode. user choose cash option it will directly make an entry for their contribution record from 'sender side'. if choose UPI option it will enable the UPI payment method directly and make an entry.

UPI Id : It will automatically filled from the invite accepted scenario.

Detailing : Receiver invite an event and share the invitation through our app/whatsapp its hold the receiver UPI Id. In this page directly fetching from there
When enduser click the gpay it will redirect the GPay app
corresponding with the provided UPI Id.

UPI Id : It will automatically filled from the invite accepted scenario.

Detailing : Receiver invite an event and share the invitation through our app/whatsapp its hold the receiver UPI Id. In this page directly fetching from there
This action is go to -> Add entry page

via Cash payment entry
via UPI payment entry
This popup msg showed after every entry both(cash & UPI)

Note : Request to frontend design
Dont change the font size and field size. maintain the same font size as per "cash payment page". When enduser click the UPI option QR code will open. want to extend the page size.

Another Scenario : If the end user think to pay through this app. user knows the application usage and make him/her entry. So login as a "sender" and make record to click the "+ "button. In this scenario, the UPI id field is empty. if user contribute via UPI, it will redirect the GPay/PhonePy app. just scan the QR code(Receiver side have their QR code image) and contribute the moi.

Records are fetching based on the user which type(sender/receiver) they are login
