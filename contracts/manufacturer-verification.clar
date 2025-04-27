;; Manufacturer Verification Contract
;; Validates legitimate vaccine producers

(define-data-var admin principal tx-sender)

;; Map to store authorized manufacturers
(define-map authorized-manufacturers principal bool)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-AUTHORIZED (err u101))
(define-constant ERR-NOT-ADMIN (err u102))

;; Check if caller is admin
(define-private (is-admin)
  (is-eq tx-sender (var-get admin)))

;; Add a manufacturer to the authorized list
(define-public (authorize-manufacturer (manufacturer principal))
  (begin
    (asserts! (is-admin) ERR-NOT-ADMIN)
    (asserts! (is-none (map-get? authorized-manufacturers manufacturer)) ERR-ALREADY-AUTHORIZED)
    (ok (map-set authorized-manufacturers manufacturer true))))

;; Remove a manufacturer from the authorized list
(define-public (revoke-manufacturer (manufacturer principal))
  (begin
    (asserts! (is-admin) ERR-NOT-ADMIN)
    (asserts! (is-some (map-get? authorized-manufacturers manufacturer)) ERR-NOT-AUTHORIZED)
    (ok (map-delete authorized-manufacturers manufacturer))))

;; Check if a manufacturer is authorized
(define-read-only (is-authorized-manufacturer (manufacturer principal))
  (default-to false (map-get? authorized-manufacturers manufacturer)))

;; Transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) ERR-NOT-ADMIN)
    (ok (var-set admin new-admin))))
