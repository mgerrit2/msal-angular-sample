# Project for testing Azure entra-id


## Features
- implementing ajax spinner
- implementing


## Ajax implementation
### Purpose
To show spinner with slow rest api call

#### The interceptor implementation
``` java
package com.gscience.security.controller.auth.m2m

import io.swagger.v3.oas.annotations.tags.Tag
import org.apache.logging.log4j.LogManager
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/api/{version}/m2m")
@Tag(name = "M2m Machine to machine controller")
class M2mController(
    private val m2mService: M2mService
) {

    private val log = LogManager.getLogger(M2mController::class.java)

    @PostMapping(
        value = [""],
        produces = [
            MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_PROBLEM_JSON_VALUE
        ]
    )
    fun doMachineTomachineOp(): ResponseEntity<Void> {
        val result = m2mService.createM2mData()

        log.info (result)

        // Returns a 201 Created status with no body
        return ResponseEntity.status(HttpStatus.CREATED).build()
    }
}
```
