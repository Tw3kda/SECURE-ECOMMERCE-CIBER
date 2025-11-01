package com.patrones.api.controller;

import com.patrones.api.service.UserRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.patrones.api.dto.RegisterRequest;


@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*") // 🔧 or restrict to your frontend URL if needed
public class AuthController {

    @Autowired
    private UserRegistrationService registrationService;

    @PostMapping("/register")
    public String registerUser(@RequestBody RegisterRequest request) {
        return registrationService.registerUser(
            request.getUsername(),
            request.getEmail(),
            request.getPassword()
        );
    }



    @GetMapping("/status")
    public String status() {
        return "Auth API is running!";
    }
}
