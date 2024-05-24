<template>
    <modal :show="show" @close="close">
        <h6 slot="header" class="modal-title" id="modal-title-notification">
            Schedule tweets from a CSV file
        </h6>

        <div>
            <p class="mb-4">
                The format is very simple: one tweet per line.<br>
                Posts will be scheduled according to your current schedule.<br><br>
                Tweets longer than 280 characters will be split into a thread.<br>
                You can only schedule <i>one year</i> of tweets.<br><br>
                <b>The CSV file should <i>not</i> include a header.</b>
            </p>

            <dropzone-file-upload v-model="csvFile" :options="uploadOptions">
            </dropzone-file-upload>

            <p class="mb-0" v-if="parsedCSVLength > 0">
                {{ parsedCSVLength }} tweets found.
            </p>

            <base-alert type="danger" class="mb-0 danger" v-if="formError">
                {{ formError }}
            </base-alert>
        </div>

        <template slot="footer">
            <base-button type="white" @click="close()">Close</base-button>
            <base-button class="primary ml-auto"
                         @click="uploadCSV"
                         :class="parsedCSVLength > 0 ? '' : 'disabled'">
                Go
            </base-button>
        </template>
    </modal>
</template>

<script>
  import DropzoneFileUpload from '@/components/Inputs/DropzoneFileUpload';
  import swal from 'sweetalert2';
  import {mapState} from 'vuex';
  const fb = require('../../firebase');
  const Papa = require('papaparse');

  export default {
    components: {
      DropzoneFileUpload
    },
    computed: {
      ...mapState(['userProfile', 'currentUser']),
    },
    data () {
      return this.initialState();
    },
    methods: {
      close() {
        Object.assign(this.$data, this.initialState());
        this.$emit('close');
      },
      initialState() {
        return {
          csvFile: [],
          formError: null,
          parsedCSVLength: null,
          uploadOptions: {
            dictDefaultMessage: 'Drop a CSV file here',
            acceptedFiles: '.csv',
          },
        };
      },
      uploadCSV: function () {
        if (!this.parsedCSVLength) return;
        const that = this;
        const userId = this.currentUser.uid;
        const fileName = this.csvFile[0].name;
        const mediaRef = fb.storageRoot.child(`csv-uploads/${userId}-${fileName}`);
        const metadata = { userId, fileName };
        mediaRef.put(this.csvFile[0], { customMetadata: metadata })
          .then(function () {
            that.close();
            that.$notify({type: 'success', message: 'This CSV file will be processed shortly.' });
          })
          .catch(error => {
            swal('', 'An error has occurred while uploading the CSV file.', 'error');
            console.error(error);
          });
      },
    },
    name: 'UploadCSVModal',
    props: {
      show: Boolean,
    },
    watch: {
      csvFile(newValue) {
        this.parsedCSVLength = null;

        if (newValue.length === 0) return;

        const file = newValue[0];

        // Sometimes the mime type is empty (caused by OpenOffice in my experience)
        if (!['', 'text/csv', 'application/vnd.ms-excel'].includes(file.type)) {
          this.formError = 'Not a CSV file.';
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          this.formError = 'The file is too big.';
          return;
        }

        Papa.parse(file, {
          skipEmptyLines: true,
          delimiter: ',',
          complete: result => {
            const tweetsTooLarge = result.data.filter(t => t.length > 280 * 100);
            if (result.errors.length > 0) {
              this.formError = `Can't parse this file. Make sure it's valid CSV.`;
            } else if (tweetsTooLarge.length !== 0) {
              this.formError = `Some tweets you are trying to schedule are too long.`;
            } else {
              this.parsedCSVLength = result.data.length;
              this.formError = null;
            }
          },
        });
      },
    },
  };
</script>

<style>
    .dz-message {
        padding: 1rem 1rem !important;
    }
</style>
