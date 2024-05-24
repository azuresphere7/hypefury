<template>
  <div class="container-fluid mt--4">
    <div class="row justify-content-center">
      <div class="col-lg-8 justify-content-center">
        <card :no-body="true"
              class="">
          <div class="card-body container-fluid retweet-container rounded border border-secondary">
            <div class="row">
              <div class="col-auto">
                Find here curated courses about growing a Twitter business and audience.
              </div>
            </div>
          </div>
        </card>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-md-12 col-lg-6" v-for="product in products">
        <school-card :title="product.title"
                     :authorName="product.authorName"
                     :authorPicture="product.authorPicture"
                     :authorTwitterProfile="product.authorTwitterProfile"
                     :productLink="product.productLink"
                     :productPicture="product.productPicture"
                     :authorBio="product.authorBio">
          <template v-slot:description>
            <p v-html="product.description"></p>
          </template>
        </school-card>
      </div>
    </div>
  </div>
</template>

<script>
  import {shuffle} from 'lodash';
  import SchoolCard from '@/views/SchoolCard';

  export default {
    components: {
      SchoolCard,
    },
    data() {
      return {
        products: shuffle([
          {
            title: 'Twitter Money Mastery',
            authorName: 'Jose Rosado',
            authorPicture: 'joserosado.jpg',
            authorTwitterProfile: 'https://twitter.com/JoseRosado',
            productLink: 'https://gumroad.com/a/344044659',
            productPicture: 'joserosado-twittermoney.jpg',
            authorBio: 'Built A 6-Figure Business With Twitter.',
            description: `
<p>Imagine tweeting a couple of times a day, and waking up with $100, $1000, $1500, $2500+</p>
<p>in your bank account a couple of days later.</p>
<p>Here’s a secret:</p>
<p>That’s totally possible with some Twitter magic.</p>
            `,
          },
          {
            title: 'The Starter\'s Guide to UNF*CK Your Twitter Account',
            authorName: 'Western Mastery',
            authorPicture: 'westernmastery.jpg',
            authorTwitterProfile: 'https://twitter.com/WesternMastery',
            productLink: 'https://gumroad.com/a/488223859',
            productPicture: 'westernmastery-starterguide.jpg',
            authorBio: 'I help men use their skills and learn new ones to change their entire lives.',
            description: `
<p>Have you been sitting around for months, if not years...wondering why your account won't grow?</p>
<p>Are you on Twitter every day, seeing other accounts with thousands of followers, making tons of money on the daily...</p>
<p>But you have only a few hundred that won't even give you a damn like?</p>
<p>If so...</p>
<p>You desperately need to UNF*CK your Twitter account.</p>
            `,
          },
          {
            title: 'Path to Twitter Dominance',
            authorName: 'Ryan Felman',
            authorPicture: 'ryanfelman.jpg',
            authorTwitterProfile: 'https://twitter.com/PathToManliness',
            productLink: 'https://gumroad.com/a/731493491',
            productPicture: 'ryanfelman-pathtotwitterdominance.png',
            authorBio: '',
            description: `
<p>
  Learn the insider secrets to conquering Twitter from a guy who gained over 10,000 followers in a year. 20,000 followers now.
</p>
<p>
  If you want to:
</p>
<ul>
  <li>Earn a solid side income, you need to build an audience to sell to</li>
  <li>Understand how others get so many more retweets than you</li>
  <li>Capture the attention of everyone who finds your account</li>
  <li>Learn this insider trick to get in front of new audiences</li>
  <li>Learn what you need to start doing right now</li>
  <li>Learn the art of crafting the perfect thread</li>
  <li>Form your tribe with like-minded people</li>
</ul>
<p>Then you need the Path to Twitter Dominance</p>
            `,
          },
          {
            title: 'Engagement is the New Cocaine',
            authorName: 'Ed Latimore',
            authorPicture: 'edlatimore.jpg',
            authorTwitterProfile: 'https://twitter.com/EdLatimore',
            productLink: 'https://gumroad.com/a/127513715',
            productPicture: 'edlatimore-engagementisthenewcocaine.jpg',
            authorBio: 'Former Heavyweight boxer | B.A. Physics | Amazon Best-Selling Author | Speaker',
            description: `
<p>I have over 85k followers on Twitter and do 20M+ impressions per month.</p>
<ul>
<li>I don't follow-for-follow</li>
<li>I don't pay for advertisement</li>
<li>I don't have a blue checkmark</li>
<li>I don't ask for follows</li>
<li>I don't ask for retweets</li>
<li>I just know how to write so well that people actually pay me to write their tweets.</li>
</ul>
<p>This is NOT a special talent, innate gift, or magic power.</p>
<p>This is a skill that anyone who NEEDS to build a dedicated fan base on Twitter can use.</p>
<p>"Engagement Is The New Cocaine: The Art and Science of Writing Highly Addictive Tweets" will teach you the techniques I use to build an audience that is so addicted to my feed that THEY PAY ME FOR TWEETS.</p>
            `,
          },
        ]),
      };
    }
  };
</script>
