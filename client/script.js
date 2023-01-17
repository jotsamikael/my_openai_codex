import bot from './assets/bot.svg'
import user from './assets/user1.png'


const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container')

let loadInterval;


/** This function prints 4 dots adding each dot after 300mls,
 * and when we reach 4 dots, we reset every thing to zero dots
 */

function loader(element){
  element.textContent = '';

  //do something every 300 mls
  loadInterval = setInterval(()=> {
    element.textContent += '.'
    if(element.textContent === '....'){
      element.textContent = '';
    }
  }, 300)

}


/***
 * This function adds characters one after another
 * every 20 mls, in order to have a feeling like the AI is actually thinking
 */

 function typeText(element, text){
   let index = 0;

   let interval = setInterval(()=>{
     if(index < text.length){
       element.innerHTML += text.charAt(index);
       index++;
     }
     else{
       clearInterval(interval)
     }
   }, 20)

 }


 /***
  * Generate a unique id for every single message
  */

  function generateUniqueId(){
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);


    return  `id-${timestamp}-${hexadecimalString}`;
  }

/**
 * This function generate the message block either of ai or user
 */
function chatStripe(isAi, value, uniqueId) {
  return (
    `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
  )
} 

/**
 * This async function submits the user query to chatGPT
 */

 const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //generate the user chat stripe
   chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

   //clear text area input
  form.reset();

  //bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);




  //Fetch data from server
   const response = await fetch('http://localhost:5000/', {
   //const response = await fetch('https://jotsa-openai-codex.onrender.com/', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       prompt: data.get('prompt')
     })
   })

   clearInterval(loadInterval);
   messageDiv.innerHTML = '';

   if(response.ok){
     const data = await response.json();
     const parsedData = data.bot.trim();
 
     typeText(messageDiv, parsedData);

   } else {
     const err = await response.text();

     messageDiv.innerHTML = "something went wrong";

     alert(err);
   }

 }

  form.addEventListener('submit', handleSubmit);

  //allows you to submit request by pressing enter key
  form.addEventListener('keyup', (e)=>{
     if(e.keyCode === 13){
       handleSubmit(e);
     }
  })

 