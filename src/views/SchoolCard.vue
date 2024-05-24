<template>
  <div>
    <div class="card card-profile">
      <img :src="`img/school/${productPicture}`" alt="" class="card-img-top">
      <div class="card-body">
        <div class="row">
          <div class="col-12">
            <div>
              <h1 class="h1">{{title}}</h1>
              <slot name="description"></slot>
            </div>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-3"></div>
          <div class="col-6 d-flex align-items-center">
            <div style="margin: auto;" class="row text-center justify-content-center w-100">
              <a class="btn btn-success w-100"
                 target="_blank"
                 :href="productLink">
                Learn more
              </a>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <card class="mb-0" body-classes="p-3">
              <div class="row align-items-center">
                <div class="col-auto d-flex align-content-center">
                  <a target="_blank" :href="authorTwitterProfile" class="avatar avatar-xl rounded-circle">
                    <img alt="Image placeholder" :src="`img/school/${authorPicture}`">
                  </a>
                </div>
                <div class="col ml--2">
                  <p class="text-sm text-muted mb-0">Author:</p>
                  <h4 class="mb-0">
                    <a target="_blank" :href="authorTwitterProfile">{{authorName}}</a>
                  </h4>
                  <p class="text-sm mb-0">{{authorBio}}</p>
                </div>
              </div>
            </card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      authorBio: String,
      authorName: String,
      authorPicture: String,
      authorTwitterProfile: String,
      productLink: String,
      productPicture: String,
      title: String,
    },
  };
</script>
