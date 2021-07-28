import { ValidationError } from '../functions/src/dto'
import { Celebration } from './celebration-service'

export default {
  methods: {
    celebrate(celebrations: Celebration[]): void {
      celebrations.forEach(celebration => {
        this.$buefy.notification.open({
          message: celebration.message,
          closable: true,
          position: 'is-bottom-right',
          hasIcon: true,
          iconPack: 'fas',
          icon: celebration.icon,
          type: 'is-success',
          duration: 2400,
        })
      })
    },
    handleError(error: { details: ValidationError[] | null }): void {
      let message
      if (error.details) {
        console.error(error.details)
        let validationErrors = error.details as ValidationError[]

        if (validationErrors.length == 1) {
          message = validationErrors[0].message
        }
        else if (validationErrors.length > 1) {
          message = 'Nem sikerült felvenni az utat: <ul>'
            + validationErrors.map((validationError) => '<li>' + validationError.message + '</li>').join('')
            + '</ul>'
        } else {
          message = 'Nem sikerült felvenni az utat. És valami nem stimmel.'
        }
      } else {
        console.error(error)
        message = 'Nem sikerült felvenni az utat. Ez nem a te hibád, én voltam, bocs. Próbáld meg később.'
      }

      this.$buefy.dialog.alert({
        title: 'Hiba',
        message: message,
        type: 'is-danger',
        hasIcon: true,
        icon: 'times-circle',
        iconPack: 'fas',
        ariaRole: 'alertdialog',
        ariaModal: true
      })
    }
  }
}
