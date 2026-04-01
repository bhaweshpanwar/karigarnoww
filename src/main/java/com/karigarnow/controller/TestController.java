package com.karigarnow.controller;

import com.karigarnow.utils.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test")
    public ResponseEntity<ApiResponse<String>> test() {
        ApiResponse<String> response = new ApiResponse<>(true, "KarigarNow API is running", null);
        return ResponseEntity.ok(response);
    }
}
